package handlers

import (
	"net/http"
	"strconv"

	"golf-course-backend/internal/database"
	"golf-course-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type StaffHandler struct{}

func NewStaffHandler() *StaffHandler {
	return &StaffHandler{}
}

// Equipment management for staff
func (h *StaffHandler) UpdateEquipmentStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid equipment ID"})
		return
	}

	var req struct {
		ConditionStatus   string `json:"condition_status"`
		QuantityAvailable int    `json:"quantity_available"`
		IsAvailable       bool   `json:"is_available"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.DB
	var equipment models.Equipment
	if err := db.First(&equipment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Equipment not found"})
		return
	}

	if req.ConditionStatus != "" {
		equipment.ConditionStatus = req.ConditionStatus
	}
	if req.QuantityAvailable >= 0 {
		equipment.QuantityAvailable = req.QuantityAvailable
	}
	equipment.IsAvailable = req.IsAvailable

	if err := db.Save(&equipment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update equipment"})
		return
	}

	c.JSON(http.StatusOK, equipment)
}

// Booking management for staff
func (h *StaffHandler) UpdateBookingStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	var req struct {
		BookingStatus string `json:"booking_status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.DB
	var booking models.TeeTime
	if err := db.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	booking.BookingStatus = req.BookingStatus

	if err := db.Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update booking"})
		return
	}

	c.JSON(http.StatusOK, booking)
}

// Course status management
func (h *StaffHandler) UpdateCourseStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	var req struct {
		IsActive bool `json:"is_active" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.DB
	var course models.Course
	if err := db.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	course.IsActive = req.IsActive

	if err := db.Save(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update course"})
		return
	}

	c.JSON(http.StatusOK, course)
}

// Get today's bookings for staff
func (h *StaffHandler) GetTodaysBookings(c *gin.Context) {
	db := database.DB
	var bookings []models.TeeTime

	if err := db.Preload("User").Preload("Course").
		Where("DATE(booking_date) = CURDATE()").
		Order("booking_time ASC").
		Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch today's bookings"})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

// Get active rentals for staff
func (h *StaffHandler) GetActiveRentals(c *gin.Context) {
	db := database.DB
	var rentals []models.EquipmentRental

	if err := db.Preload("User").Preload("Equipment").
		Where("return_date IS NULL").
		Find(&rentals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch active rentals"})
		return
	}

	c.JSON(http.StatusOK, rentals)
}

// Staff dashboard stats
type StaffStats struct {
	TodaysBookings  int64 `json:"todays_bookings"`
	ActiveRentals   int64 `json:"active_rentals"`
	EquipmentIssues int64 `json:"equipment_issues"`
	CourseClosures  int64 `json:"course_closures"`
}

func (h *StaffHandler) GetStaffStats(c *gin.Context) {
	db := database.DB
	var stats StaffStats

	// Today's bookings
	db.Model(&models.TeeTime{}).Where("DATE(booking_date) = CURDATE()").Count(&stats.TodaysBookings)

	// Active rentals
	db.Model(&models.EquipmentRental{}).Where("return_date IS NULL").Count(&stats.ActiveRentals)

	// Equipment with issues (maintenance status)
	db.Model(&models.Equipment{}).Where("condition_status = 'maintenance'").Count(&stats.EquipmentIssues)

	// Inactive courses
	db.Model(&models.Course{}).Where("is_active = false").Count(&stats.CourseClosures)

	c.JSON(http.StatusOK, stats)
}
