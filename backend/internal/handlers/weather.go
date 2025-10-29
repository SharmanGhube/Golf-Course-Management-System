package handlers

import (
	"encoding/json"
	"fmt"
	"golf-course-backend/internal/database"
	"golf-course-backend/internal/models"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type WeatherHandler struct{}

func NewWeatherHandler() *WeatherHandler {
	return &WeatherHandler{}
}

// WeatherAPI.com response structure (Free tier: 1M calls/month)
type WeatherAPIResponse struct {
	Location struct {
		Name    string `json:"name"`
		Region  string `json:"region"`
		Country string `json:"country"`
	} `json:"location"`
	Current struct {
		TempC     float64 `json:"temp_c"`
		TempF     float64 `json:"temp_f"`
		Condition struct {
			Text string `json:"text"`
			Icon string `json:"icon"`
		} `json:"condition"`
		WindMph    float64 `json:"wind_mph"`
		WindKph    float64 `json:"wind_kph"`
		WindDegree int     `json:"wind_degree"`
		WindDir    string  `json:"wind_dir"`
		Humidity   int     `json:"humidity"`
		Cloud      int     `json:"cloud"`
		FeelsLikeC float64 `json:"feelslike_c"`
		VisKm      float64 `json:"vis_km"`
		UV         float64 `json:"uv"`
	} `json:"current"`
}

// @Summary Get current weather for course
// @Description Get current weather conditions for a specific golf course
// @Tags weather
// @Produce json
// @Param course_id path int true "Course ID"
// @Success 200 {object} models.WeatherLog
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /weather/course/{course_id} [get]
func (h *WeatherHandler) GetCourseWeather(c *gin.Context) {
	courseID, err := strconv.Atoi(c.Param("course_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	// Check if course exists
	var course models.Course
	if err := database.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	// Check if we have today's weather data (unless force refresh is requested)
	forceRefresh := c.Query("refresh") == "true"
	today := time.Now().Format("2006-01-02")
	var weatherLog models.WeatherLog

	if !forceRefresh {
		err = database.DB.Preload("Course").Where("course_id = ? AND DATE(date) = ?", courseID, today).Order("created_at DESC").First(&weatherLog).Error
		if err == nil {
			// If course data is missing, load it manually
			if weatherLog.Course.ID == 0 {
				var course models.Course
				if err := database.DB.First(&course, courseID).Error; err == nil {
					weatherLog.Course = course
				}
			}
			// Return cached weather data
			c.JSON(http.StatusOK, weatherLog)
			return
		}
	} else {
		// Force refresh: delete any existing records for today
		database.DB.Where("course_id = ? AND DATE(date) = ?", courseID, today).Delete(&models.WeatherLog{})
	}

	// Get weather from WeatherAPI.com
	apiKey := os.Getenv("WEATHER_API_KEY")
	if apiKey == "" || apiKey == "your_weatherapi_key_here" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Weather API key not configured"})
		return
	}

	weatherLog, err = h.fetchFromWeatherAPI(apiKey, courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weather data: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, weatherLog)
}

func (h *WeatherHandler) fetchFromWeatherAPI(apiKey string, courseID int) (models.WeatherLog, error) {
	// Pinewoods Golf Club, Hinjawadi, Pune, Maharashtra, India
	location := "Pune,Maharashtra,India"

	url := fmt.Sprintf("http://api.weatherapi.com/v1/current.json?key=%s&q=%s&aqi=no", apiKey, location)

	resp, err := http.Get(url)
	if err != nil {
		return models.WeatherLog{}, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return models.WeatherLog{}, err
	}

	var weatherResp WeatherAPIResponse
	if err := json.Unmarshal(body, &weatherResp); err != nil {
		return models.WeatherLog{}, err
	}

	// Map data
	temp := weatherResp.Current.TempC
	humidity := weatherResp.Current.Humidity
	windSpeed := weatherResp.Current.WindKph
	visibility := weatherResp.Current.VisKm
	windDirection := h.getWindDirection(weatherResp.Current.WindDegree)
	weatherCondition := weatherResp.Current.Condition.Text

	weatherLog := models.WeatherLog{
		CourseID:         uint(courseID),
		Date:             time.Now(),
		Temperature:      &temp,
		Humidity:         &humidity,
		WindSpeed:        &windSpeed,
		WindDirection:    windDirection,
		WeatherCondition: weatherCondition,
		Visibility:       &visibility,
		APIResponse:      string(body),
	}

	// Delete any existing records for today first to avoid duplicates
	today := time.Now().Format("2006-01-02")
	database.DB.Where("course_id = ? AND DATE(date) = ?", courseID, today).Delete(&models.WeatherLog{})

	// Create new record with fresh data
	if err := database.DB.Create(&weatherLog).Error; err != nil {
		return models.WeatherLog{}, err
	}

	// Load the course data for the response
	var course models.Course
	if err := database.DB.First(&course, courseID).Error; err == nil {
		weatherLog.Course = course
	}

	return weatherLog, nil
}

func (h *WeatherHandler) GetCourseWeatherHistory(c *gin.Context) {
	courseID, err := strconv.Atoi(c.Param("course_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	// Check if course exists
	var course models.Course
	if err := database.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	// Get number of days (default 7)
	days := 7
	if daysStr := c.Query("days"); daysStr != "" {
		if d, err := strconv.Atoi(daysStr); err == nil && d > 0 && d <= 30 {
			days = d
		}
	}

	// Calculate date range
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	var weatherLogs []models.WeatherLog
	if err := database.DB.Preload("Course").Where("course_id = ? AND date BETWEEN ? AND ?",
		courseID, startDate, endDate).Order("date DESC").Find(&weatherLogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weather history"})
		return
	}

	c.JSON(http.StatusOK, weatherLogs)
}

func (h *WeatherHandler) getWindDirection(degrees int) string {
	directions := []string{"N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
		"S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"}

	index := int((float64(degrees) + 11.25) / 22.5)
	return directions[index%16]
}
