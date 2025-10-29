package handlers

import (
	"golf-course-backend/internal/database"
	"golf-course-backend/internal/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type EquipmentHandler struct{}

func NewEquipmentHandler() *EquipmentHandler {
	return &EquipmentHandler{}
}

type EquipmentRentalRequest struct {
	EquipmentID uint   `json:"equipment_id" binding:"required"`
	RentalDate  string `json:"rental_date" binding:"required"`
	ReturnDate  string `json:"return_date" binding:"required"`
	Quantity    int    `json:"quantity" binding:"required,min=1"`
	Notes       string `json:"notes"`
}

// @Summary Get all equipment
// @Description Get all available equipment for rental
// @Tags equipment
// @Produce json
// @Param category query string false "Equipment category"
// @Success 200 {array} models.Equipment
// @Router /equipment [get]
func (h *EquipmentHandler) GetEquipment(c *gin.Context) {
	category := c.Query("category")

	query := database.DB.Where("is_available = ? AND quantity_available > 0", true)
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var equipment []models.Equipment
	if err := query.Find(&equipment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch equipment"})
		return
	}

	c.JSON(http.StatusOK, equipment)
}

// @Summary Get equipment by ID
// @Description Get specific equipment details
// @Tags equipment
// @Produce json
// @Param id path int true "Equipment ID"
// @Success 200 {object} models.Equipment
// @Failure 404 {object} map[string]string
// @Router /equipment/{id} [get]
func (h *EquipmentHandler) GetEquipmentByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid equipment ID"})
		return
	}

	var equipment models.Equipment
	if err := database.DB.First(&equipment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Equipment not found"})
		return
	}

	c.JSON(http.StatusOK, equipment)
}

// @Summary Rent equipment
// @Description Rent equipment for specified dates
// @Tags equipment
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body EquipmentRentalRequest true "Equipment rental request"
// @Success 201 {object} models.EquipmentRental
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /equipment/rentals [post]
func (h *EquipmentHandler) RentEquipment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req EquipmentRentalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse dates
	rentalDate, err := time.Parse("2006-01-02", req.RentalDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rental date format"})
		return
	}

	returnDate, err := time.Parse("2006-01-02", req.ReturnDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid return date format"})
		return
	}

	if returnDate.Before(rentalDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Return date must be after rental date"})
		return
	}

	// Check equipment availability
	var equipment models.Equipment
	if err := database.DB.First(&equipment, req.EquipmentID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Equipment not found"})
		return
	}

	if !equipment.IsAvailable || equipment.QuantityAvailable < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Equipment not available in requested quantity"})
		return
	}

	// Calculate rental duration and price
	duration := int(returnDate.Sub(rentalDate).Hours()/24) + 1 // Include both rental and return dates
	rentalPrice := equipment.RentalPricePerDay * float64(req.Quantity) * float64(duration)
	depositAmount := rentalPrice * 0.2 // 20% deposit

	// Create rental
	rental := models.EquipmentRental{
		UserID:        userID.(uint),
		EquipmentID:   req.EquipmentID,
		RentalDate:    rentalDate,
		ReturnDate:    &returnDate,
		Quantity:      req.Quantity,
		RentalPrice:   rentalPrice,
		DepositAmount: depositAmount,
		PaymentStatus: "pending",
		RentalStatus:  "rented",
		Notes:         req.Notes,
	}

	if err := database.DB.Create(&rental).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create rental"})
		return
	}

	// Update equipment quantity
	equipment.QuantityAvailable -= req.Quantity
	database.DB.Save(&equipment)

	// Preload relationships for response
	database.DB.Preload("User").Preload("Equipment").First(&rental, rental.ID)

	c.JSON(http.StatusCreated, rental)
}

// @Summary Get user's equipment rentals
// @Description Get all equipment rentals for the authenticated user
// @Tags equipment
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.EquipmentRental
// @Failure 401 {object} map[string]string
// @Router /equipment/rentals [get]
func (h *EquipmentHandler) GetUserRentals(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var rentals []models.EquipmentRental
	if err := database.DB.Preload("Equipment").Where("user_id = ?", userID).
		Order("rental_date DESC").Find(&rentals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rentals"})
		return
	}

	c.JSON(http.StatusOK, rentals)
}

// @Summary Return equipment
// @Description Mark equipment as returned
// @Tags equipment
// @Produce json
// @Security BearerAuth
// @Param id path int true "Rental ID"
// @Success 200 {object} models.EquipmentRental
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /equipment/rentals/{id}/return [put]
func (h *EquipmentHandler) ReturnEquipment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rental ID"})
		return
	}

	var rental models.EquipmentRental
	if err := database.DB.Preload("Equipment").Where("id = ? AND user_id = ?", id, userID).First(&rental).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rental not found"})
		return
	}

	if rental.RentalStatus == "returned" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Equipment already returned"})
		return
	}

	// Update rental status
	now := time.Now()
	rental.ReturnDate = &now
	rental.RentalStatus = "returned"

	if err := database.DB.Save(&rental).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update rental"})
		return
	}

	// Update equipment quantity
	var equipment models.Equipment
	if err := database.DB.First(&equipment, rental.EquipmentID).Error; err == nil {
		equipment.QuantityAvailable += rental.Quantity
		database.DB.Save(&equipment)
	}

	c.JSON(http.StatusOK, rental)
}
