package handlers

import (
	"golf-course-backend/internal/database"
	"golf-course-backend/internal/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type TeeTimeHandler struct{}

func NewTeeTimeHandler() *TeeTimeHandler {
	return &TeeTimeHandler{}
}

type TeeTimeRequest struct {
	CourseID        uint   `json:"course_id" binding:"required"`
	BookingDate     string `json:"booking_date" binding:"required"`
	TeeTime         string `json:"tee_time" binding:"required"`
	PlayersCount    int    `json:"players_count" binding:"required,min=1,max=4"`
	CartRequired    bool   `json:"cart_required"`
	SpecialRequests string `json:"special_requests"`
}

// @Summary Create tee time booking
// @Description Book a tee time for golf
// @Tags tee-times
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body TeeTimeRequest true "Tee time booking request"
// @Success 201 {object} models.TeeTime
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /tee-times [post]
func (h *TeeTimeHandler) CreateTeeTime(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req TeeTimeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse booking date
	bookingDate, err := time.Parse("2006-01-02", req.BookingDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking date format"})
		return
	}

	// Check if course exists
	var course models.Course
	if err := database.DB.First(&course, req.CourseID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Course not found"})
		return
	}

	// Check if tee time is available
	var existingTeeTime models.TeeTime
	err = database.DB.Where("course_id = ? AND booking_date = ? AND tee_time = ?",
		req.CourseID, bookingDate, req.TeeTime).First(&existingTeeTime).Error
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Tee time not available"})
		return
	}

	// Calculate total amount
	totalAmount := course.GreenFee * float64(req.PlayersCount)
	if req.CartRequired {
		totalAmount += course.CartFee
	}

	// Create tee time
	teeTime := models.TeeTime{
		CourseID:        req.CourseID,
		UserID:          userID.(uint),
		BookingDate:     bookingDate,
		TeeTime:         req.TeeTime,
		PlayersCount:    req.PlayersCount,
		CartRequired:    req.CartRequired,
		TotalAmount:     totalAmount,
		SpecialRequests: req.SpecialRequests,
		PaymentStatus:   "pending",
		BookingStatus:   "confirmed",
	}

	if err := database.DB.Create(&teeTime).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tee time"})
		return
	}

	// Preload relationships for response
	database.DB.Preload("Course").Preload("User").First(&teeTime, teeTime.ID)

	c.JSON(http.StatusCreated, teeTime)
}

// @Summary Get user's tee times
// @Description Get all tee times for the authenticated user
// @Tags tee-times
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.TeeTime
// @Failure 401 {object} map[string]string
// @Router /tee-times [get]
func (h *TeeTimeHandler) GetUserTeeTimes(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var teeTimes []models.TeeTime
	if err := database.DB.Preload("Course").Where("user_id = ?", userID).
		Order("booking_date DESC, tee_time DESC").Find(&teeTimes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tee times"})
		return
	}

	c.JSON(http.StatusOK, teeTimes)
}

// @Summary Get available tee times
// @Description Get available tee times for a specific course and date
// @Tags tee-times
// @Produce json
// @Param course_id query int true "Course ID"
// @Param date query string true "Date (YYYY-MM-DD)"
// @Success 200 {array} object
// @Failure 400 {object} map[string]string
// @Router /tee-times/available [get]
func (h *TeeTimeHandler) GetAvailableTeeTimes(c *gin.Context) {
	courseIDStr := c.Query("course_id")
	dateStr := c.Query("date")

	if courseIDStr == "" || dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "course_id and date are required"})
		return
	}

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	// Check if course exists
	var course models.Course
	if err := database.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	// Get booked tee times
	var bookedTimes []string
	database.DB.Model(&models.TeeTime{}).
		Where("course_id = ? AND booking_date = ? AND booking_status != 'cancelled'", courseID, date).
		Pluck("tee_time", &bookedTimes)

	// Generate all possible tee times (6 AM to 3 PM, every 15 minutes)
	allTimes := []map[string]interface{}{}
	start := time.Date(date.Year(), date.Month(), date.Day(), 6, 0, 0, 0, time.Local)
	end := time.Date(date.Year(), date.Month(), date.Day(), 15, 0, 0, 0, time.Local)

	// Create a map of booked times for quick lookup
	bookedMap := make(map[string]bool)
	for _, bookedTime := range bookedTimes {
		bookedMap[bookedTime] = true
	}

	// Generate available time slots
	id := 1
	for t := start; t.Before(end); t = t.Add(15 * time.Minute) {
		timeStr := t.Format("15:04")
		if !bookedMap[timeStr] {
			teeTime := map[string]interface{}{
				"id":              id,
				"course_id":       courseID,
				"date":            dateStr,
				"time":            timeStr,
				"available_spots": 4, // Maximum 4 players per tee time
				"price":           course.GreenFee,
				"course_name":     course.Name,
			}
			allTimes = append(allTimes, teeTime)
			id++
		}
	}

	c.JSON(http.StatusOK, allTimes)
}
