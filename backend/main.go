package main

import (
	"golf-course-backend/internal/auth"
	"golf-course-backend/internal/config"
	"golf-course-backend/internal/database"
	"golf-course-backend/internal/routes"
	"log"

	"github.com/gin-gonic/gin"
)

// @title Golf Course Management API
// @version 1.0
// @description A comprehensive golf course management system API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	// Initialize database
	if err := database.Initialize(cfg); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Initialize auth service
	authService := auth.NewAuthService(cfg.JWT.Secret, cfg.JWT.ExpiryHours)

	// Create Gin router
	r := gin.Default()

	// Set request size limits
	r.MaxMultipartMemory = 10 << 20 // 10 MB

	// Setup routes (includes health check)
	routes.SetupRoutes(r, authService)

	// Start server
	log.Printf("🚀 Starting Golf Course Management API on port %s", cfg.Server.Port)
	log.Printf("📊 Mode: %s", cfg.Server.GinMode)
	log.Printf("🔗 Health check: http://localhost:%s/health", cfg.Server.Port)

	if err := r.Run(":" + cfg.Server.Port); err != nil {
		log.Fatal("❌ Failed to start server:", err)
	}
}
