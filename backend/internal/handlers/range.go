package handlers

import (
	"golf-course-backend/internal/database"
	"golf-course-backend/internal/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type RangeHandler struct{}

func NewRangeHandler() *RangeHandler {
	return &RangeHandler{}
}

type RangeSessionRequest struct {
	SessionDate     string `json:"session_date" binding:"required"`
	StartTime       string `json:"start_time" binding:"required"`
	DurationMinutes int    `json:"duration_minutes"`
	BallBucketSize  string `json:"ball_bucket_size" binding:"required"`
	BayNumber       int    `json:"bay_number"`
}

// @Summary Book range session
// @Description Book a driving range session
// @Tags range
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body RangeSessionRequest true "Range session request"
// @Success 201 {object} models.RangeSession
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /range/sessions [post]
func (h *RangeHandler) BookRangeSession(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req RangeSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse session date
	sessionDate, err := time.Parse("2006-01-02", req.SessionDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session date format"})
		return
	}

	// Set default duration if not provided
	if req.DurationMinutes == 0 {
		req.DurationMinutes = 60
	}

	// Get bucket price from system settings
	bucketPrice := getBucketPrice(req.BallBucketSize)

	// Create range session
	rangeSession := models.RangeSession{
		UserID:          userID.(uint),
		SessionDate:     sessionDate,
		StartTime:       req.StartTime,
		DurationMinutes: req.DurationMinutes,
		BallBucketSize:  req.BallBucketSize,
		BucketPrice:     bucketPrice,
		PaymentStatus:   "pending",
		SessionStatus:   "booked",
	}

	if req.BayNumber > 0 {
		rangeSession.BayNumber = &req.BayNumber
	}

	if err := database.DB.Create(&rangeSession).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to book range session"})
		return
	}

	// Preload user for response
	database.DB.Preload("User").First(&rangeSession, rangeSession.ID)

	c.JSON(http.StatusCreated, rangeSession)
}

// @Summary Get user's range sessions
// @Description Get all range sessions for the authenticated user
// @Tags range
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.RangeSession
// @Failure 401 {object} map[string]string
// @Router /range/sessions [get]
func (h *RangeHandler) GetUserRangeSessions(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var sessions []models.RangeSession
	if err := database.DB.Where("user_id = ?", userID).
		Order("session_date DESC, start_time DESC").Find(&sessions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch range sessions"})
		return
	}

	c.JSON(http.StatusOK, sessions)
}

// @Summary Get bucket prices
// @Description Get prices for different ball bucket sizes
// @Tags range
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /range/bucket-prices [get]
func (h *RangeHandler) GetBucketPrices(c *gin.Context) {
	prices := map[string]interface{}{
		"small":  getBucketPrice("small"),
		"medium": getBucketPrice("medium"),
		"large":  getBucketPrice("large"),
		"jumbo":  getBucketPrice("jumbo"),
		"balls": map[string]int{
			"small":  50,
			"medium": 75,
			"large":  100,
			"jumbo":  150,
		},
	}

	c.JSON(http.StatusOK, prices)
}

func getBucketPrice(bucketSize string) float64 {
	var setting models.SystemSetting
	settingKey := bucketSize + "_bucket_price"

	if err := database.DB.Where("setting_key = ?", settingKey).First(&setting).Error; err != nil {
		// Default prices if setting not found
		switch bucketSize {
		case "small":
			return 8.00
		case "medium":
			return 12.00
		case "large":
			return 16.00
		case "jumbo":
			return 22.00
		default:
			return 8.00
		}
	}

	price, _ := strconv.ParseFloat(setting.SettingValue, 64)
	return price
}
