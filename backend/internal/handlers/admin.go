package handlers

import (
	"net/http"
	"strconv"

	"golf-course-backend/internal/database"
	"golf-course-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// Course Management
type CreateCourseRequest struct {
	Name         string  `json:"name" binding:"required"`
	Description  string  `json:"description"`
	Address      string  `json:"address" binding:"required"`
	Phone        string  `json:"phone"`
	Email        string  `json:"email"`
	Par          int     `json:"par" binding:"required"`
	TotalHoles   int     `json:"total_holes" binding:"required"`
	CourseRating float64 `json:"course_rating"`
	SlopeRating  int     `json:"slope_rating"`
	GreenFee     float64 `json:"green_fee" binding:"required"`
	CartFee      float64 `json:"cart_fee"`
	IsActive     bool    `json:"is_active"`
}

func (h *AdminHandler) CreateCourse(c *gin.Context) {
	var req CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	course := models.Course{
		Name:        req.Name,
		Description: req.Description,
		Address:     req.Address,
		Phone:       req.Phone,
		Email:       req.Email,
		Par:         req.Par,
		TotalHoles:  req.TotalHoles,
		GreenFee:    req.GreenFee,
		CartFee:     req.CartFee,
		IsActive:    req.IsActive,
	}

	if req.CourseRating > 0 {
		course.CourseRating = &req.CourseRating
	}
	if req.SlopeRating > 0 {
		course.SlopeRating = &req.SlopeRating
	}

	db := database.DB
	if err := db.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
		return
	}

	c.JSON(http.StatusCreated, course)
}

func (h *AdminHandler) UpdateCourse(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	var req CreateCourseRequest
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

	course.Name = req.Name
	course.Description = req.Description
	course.Address = req.Address
	course.Phone = req.Phone
	course.Email = req.Email
	course.Par = req.Par
	course.TotalHoles = req.TotalHoles
	course.GreenFee = req.GreenFee
	course.CartFee = req.CartFee
	course.IsActive = req.IsActive

	if req.CourseRating > 0 {
		course.CourseRating = &req.CourseRating
	}
	if req.SlopeRating > 0 {
		course.SlopeRating = &req.SlopeRating
	}

	if err := db.Save(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update course"})
		return
	}

	c.JSON(http.StatusOK, course)
}

func (h *AdminHandler) DeleteCourse(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	db := database.DB
	var course models.Course
	if err := db.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	if err := db.Delete(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}

// Equipment Management
type CreateEquipmentRequest struct {
	Name              string  `json:"name" binding:"required"`
	Description       string  `json:"description"`
	Category          string  `json:"category" binding:"required"`
	RentalPricePerDay float64 `json:"rental_price_per_day" binding:"required"`
	QuantityAvailable int     `json:"quantity_available" binding:"required"`
	ConditionStatus   string  `json:"condition_status"`
	IsAvailable       bool    `json:"is_available"`
}

func (h *AdminHandler) CreateEquipment(c *gin.Context) {
	var req CreateEquipmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	equipment := models.Equipment{
		Name:              req.Name,
		Description:       req.Description,
		Category:          req.Category,
		RentalPricePerDay: req.RentalPricePerDay,
		QuantityAvailable: req.QuantityAvailable,
		ConditionStatus:   req.ConditionStatus,
		IsAvailable:       req.IsAvailable,
	}

	if req.ConditionStatus == "" {
		equipment.ConditionStatus = "good"
	}

	db := database.DB
	if err := db.Create(&equipment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create equipment"})
		return
	}

	c.JSON(http.StatusCreated, equipment)
}

func (h *AdminHandler) UpdateEquipment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid equipment ID"})
		return
	}

	var req CreateEquipmentRequest
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

	equipment.Name = req.Name
	equipment.Description = req.Description
	equipment.Category = req.Category
	equipment.RentalPricePerDay = req.RentalPricePerDay
	equipment.QuantityAvailable = req.QuantityAvailable
	equipment.ConditionStatus = req.ConditionStatus
	equipment.IsAvailable = req.IsAvailable

	if err := db.Save(&equipment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update equipment"})
		return
	}

	c.JSON(http.StatusOK, equipment)
}

func (h *AdminHandler) DeleteEquipment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid equipment ID"})
		return
	}

	db := database.DB
	var equipment models.Equipment
	if err := db.First(&equipment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Equipment not found"})
		return
	}

	if err := db.Delete(&equipment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete equipment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Equipment deleted successfully"})
}

// User Management
func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	db := database.DB
	var users []models.User

	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Remove password hash from response
	for i := range users {
		users[i].PasswordHash = ""
	}

	c.JSON(http.StatusOK, users)
}

type UpdateUserRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Role      string `json:"role"`
	IsActive  bool   `json:"is_active"`
}

func (h *AdminHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.DB
	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	user.IsActive = req.IsActive

	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	user.PasswordHash = "" // Don't return password hash
	c.JSON(http.StatusOK, user)
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	db := database.DB
	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := db.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// Booking Management
func (h *AdminHandler) GetAllBookings(c *gin.Context) {
	db := database.DB
	var bookings []models.TeeTime

	if err := db.Preload("User").Preload("Course").Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

func (h *AdminHandler) GetAllRentals(c *gin.Context) {
	db := database.DB
	var rentals []models.EquipmentRental

	if err := db.Preload("User").Preload("Equipment").Find(&rentals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rentals"})
		return
	}

	c.JSON(http.StatusOK, rentals)
}

// Reports
type AdminStats struct {
	TotalUsers       int64   `json:"total_users"`
	TotalCourses     int64   `json:"total_courses"`
	TotalEquipment   int64   `json:"total_equipment"`
	TotalBookings    int64   `json:"total_bookings"`
	TotalRentals     int64   `json:"total_rentals"`
	TotalRevenue     float64 `json:"total_revenue"`
	MonthlyRevenue   float64 `json:"monthly_revenue"`
	ActiveRentals    int64   `json:"active_rentals"`
	UpcomingBookings int64   `json:"upcoming_bookings"`
}

func (h *AdminHandler) GetAdminStats(c *gin.Context) {
	db := database.DB
	var stats AdminStats

	// Count totals
	db.Model(&models.User{}).Count(&stats.TotalUsers)
	db.Model(&models.Course{}).Count(&stats.TotalCourses)
	db.Model(&models.Equipment{}).Count(&stats.TotalEquipment)
	db.Model(&models.TeeTime{}).Count(&stats.TotalBookings)
	db.Model(&models.EquipmentRental{}).Count(&stats.TotalRentals)

	// Calculate revenue
	var teeTimeRevenue, equipmentRevenue float64
	db.Model(&models.TeeTime{}).Select("COALESCE(SUM(total_amount), 0)").Scan(&teeTimeRevenue)
	db.Model(&models.EquipmentRental{}).Select("COALESCE(SUM(rental_price), 0)").Scan(&equipmentRevenue)
	stats.TotalRevenue = teeTimeRevenue + equipmentRevenue

	// Monthly revenue (current month)
	var monthlyTeeTime, monthlyEquipment float64
	db.Model(&models.TeeTime{}).Select("COALESCE(SUM(total_amount), 0)").
		Where("MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())").
		Scan(&monthlyTeeTime)
	db.Model(&models.EquipmentRental{}).Select("COALESCE(SUM(rental_price), 0)").
		Where("MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())").
		Scan(&monthlyEquipment)
	stats.MonthlyRevenue = monthlyTeeTime + monthlyEquipment

	// Active rentals and upcoming bookings
	db.Model(&models.EquipmentRental{}).Where("return_date IS NULL").Count(&stats.ActiveRentals)
	db.Model(&models.TeeTime{}).Where("booking_date >= CURDATE()").Count(&stats.UpcomingBookings)

	c.JSON(http.StatusOK, stats)
}
