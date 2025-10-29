package handlers

import (
	"net/http"
	"time"

	"golf-course-backend/internal/database"
	"golf-course-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct{}

func NewDashboardHandler() *DashboardHandler {
	return &DashboardHandler{}
}

type DashboardStats struct {
	UpcomingTeeTimes int     `json:"upcoming_tee_times"`
	RangeSessions    int     `json:"range_sessions"`
	EquipmentRentals int     `json:"equipment_rentals"`
	TotalSpent       float64 `json:"total_spent"`
}

func (h *DashboardHandler) GetDashboardStats(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, ok := userIDStr.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	db := database.DB

	// Get upcoming tee times count (only future dates)
	var upcomingTeeTimes int64
	db.Model(&models.TeeTime{}).Where("user_id = ? AND booking_date >= CURDATE()", userID).Count(&upcomingTeeTimes)

	// Get upcoming range sessions count (only future dates)
	var rangeSessions int64
	db.Model(&models.RangeSession{}).Where("user_id = ? AND session_date >= CURDATE()", userID).Count(&rangeSessions)

	// Get active equipment rentals count (not yet returned)
	var equipmentRentals int64
	db.Model(&models.EquipmentRental{}).Where("user_id = ? AND return_date IS NULL", userID).Count(&equipmentRentals)

	// Calculate total spent (from all bookings and rentals)
	var totalSpent float64

	// Sum from tee times
	var teeTimeTotal float64
	db.Model(&models.TeeTime{}).Select("COALESCE(SUM(total_amount), 0)").Where("user_id = ?", userID).Scan(&teeTimeTotal)

	// Sum from range sessions
	var rangeTotal float64
	db.Model(&models.RangeSession{}).Select("COALESCE(SUM(bucket_price), 0)").Where("user_id = ?", userID).Scan(&rangeTotal)

	// Sum from equipment rentals
	var equipmentTotal float64
	db.Model(&models.EquipmentRental{}).Select("COALESCE(SUM(rental_price), 0)").Where("user_id = ?", userID).Scan(&equipmentTotal)

	totalSpent = teeTimeTotal + rangeTotal + equipmentTotal

	stats := DashboardStats{
		UpcomingTeeTimes: int(upcomingTeeTimes),
		RangeSessions:    int(rangeSessions),
		EquipmentRentals: int(equipmentRentals),
		TotalSpent:       totalSpent,
	}

	c.JSON(http.StatusOK, stats)
}

type ActivityItem struct {
	ID          uint    `json:"id"`
	Type        string  `json:"type"` // "tee_time", "range_session", "equipment_rental"
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Date        string  `json:"date"`
	Status      string  `json:"status"`
}

func (h *DashboardHandler) GetRecentActivity(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, ok := userIDStr.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	db := database.DB
	var activities []ActivityItem
	now := time.Now()

	// Get recent tee times (last 30 days and upcoming)
	var teeTimes []models.TeeTime
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	db.Preload("Course").Where("user_id = ? AND booking_date >= ?", userID, thirtyDaysAgo).
		Order("booking_date DESC, tee_time DESC").
		Limit(10).
		Find(&teeTimes)

	for _, tt := range teeTimes {
		// Combine booking date and tee time for proper comparison
		bookingDateTime, err := time.Parse("2006-01-02 15:04", tt.BookingDate.Format("2006-01-02")+" "+tt.TeeTime)
		if err != nil {
			bookingDateTime = tt.BookingDate
		}

		status := "Upcoming"
		if bookingDateTime.Before(now) {
			status = "Completed"
		}

		activities = append(activities, ActivityItem{
			ID:          tt.ID,
			Type:        "tee_time",
			Title:       "Tee Time Booked",
			Description: tt.Course.Name + " - " + tt.BookingDate.Format("Jan 2, 2006") + " at " + tt.TeeTime,
			Amount:      tt.TotalAmount,
			Date:        tt.CreatedAt.Format("Jan 2, 2006"),
			Status:      status,
		})
	}

	// Get recent range sessions (last 30 days and upcoming)
	var rangeSessions []models.RangeSession
	db.Where("user_id = ? AND session_date >= ?", userID, thirtyDaysAgo).
		Order("session_date DESC, start_time DESC").
		Limit(10).
		Find(&rangeSessions)

	for _, rs := range rangeSessions {
		// Combine session date and start time for proper comparison
		sessionDateTime, err := time.Parse("2006-01-02 15:04", rs.SessionDate.Format("2006-01-02")+" "+rs.StartTime)
		if err != nil {
			sessionDateTime = rs.SessionDate
		}

		status := "Upcoming"
		if sessionDateTime.Before(now) {
			status = "Completed"
		}

		activities = append(activities, ActivityItem{
			ID:          rs.ID,
			Type:        "range_session",
			Title:       "Range Session",
			Description: "Driving Range - " + rs.SessionDate.Format("Jan 2, 2006") + " at " + rs.StartTime,
			Amount:      rs.BucketPrice,
			Date:        rs.CreatedAt.Format("Jan 2, 2006"),
			Status:      status,
		})
	}

	// Get recent equipment rentals (last 30 days and active)
	var equipmentRentals []models.EquipmentRental
	db.Preload("Equipment").Where("user_id = ? AND rental_date >= ?", userID, thirtyDaysAgo).
		Order("rental_date DESC").
		Limit(10).
		Find(&equipmentRentals)

	for _, er := range equipmentRentals {
		status := "Active"
		if er.ReturnDate != nil {
			status = "Returned"
		} else if er.RentalDate.Before(now.AddDate(0, 0, -7)) { // Consider overdue after 7 days
			status = "Overdue"
		}

		activities = append(activities, ActivityItem{
			ID:          er.ID,
			Type:        "equipment_rental",
			Title:       "Equipment Rental",
			Description: er.Equipment.Name + " - rented " + er.RentalDate.Format("Jan 2, 2006"),
			Amount:      er.RentalPrice,
			Date:        er.CreatedAt.Format("Jan 2, 2006"),
			Status:      status,
		})
	}

	// Sort all activities by creation date (most recent first)
	// Simple bubble sort for mixed activities
	for i := 0; i < len(activities)-1; i++ {
		for j := 0; j < len(activities)-i-1; j++ {
			date1, _ := time.Parse("Jan 2, 2006", activities[j].Date)
			date2, _ := time.Parse("Jan 2, 2006", activities[j+1].Date)
			if date1.Before(date2) {
				activities[j], activities[j+1] = activities[j+1], activities[j]
			}
		}
	}

	c.JSON(http.StatusOK, activities)
}
