package routes

import (
	"golf-course-backend/internal/auth"
	"golf-course-backend/internal/handlers"
	"golf-course-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, authService *auth.AuthService) {
	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	courseHandler := handlers.NewCourseHandler()
	teeTimeHandler := handlers.NewTeeTimeHandler()
	rangeHandler := handlers.NewRangeHandler()
	equipmentHandler := handlers.NewEquipmentHandler()
	weatherHandler := handlers.NewWeatherHandler()
	dashboardHandler := handlers.NewDashboardHandler()
	adminHandler := handlers.NewAdminHandler()
	staffHandler := handlers.NewStaffHandler()
	healthHandler := handlers.NewHealthHandler()

	// Global middleware (order matters!)
	r.Use(middleware.SecurityHeadersMiddleware()) // Security headers first
	r.Use(middleware.CORSMiddleware())            // CORS second
	r.Use(middleware.RateLimitMiddleware())       // Rate limiting third

	// Health check endpoints (no auth, no rate limit)
	r.GET("/health", healthHandler.HealthCheck)
	r.GET("/health/ready", healthHandler.ReadinessCheck)
	r.GET("/health/live", healthHandler.LivenessCheck)

	// API version 1
	v1 := r.Group("/api/v1")

	// Public routes with stricter rate limiting on auth
	auth := v1.Group("/auth")
	auth.Use(middleware.AuthRateLimitMiddleware()) // Strict rate limit for auth
	{
		auth.POST("/signup", authHandler.Signup)
		auth.POST("/login", authHandler.Login)
	}

	// Courses (public for viewing)
	courses := v1.Group("/courses")
	{
		courses.GET("", courseHandler.GetCourses)
		courses.GET("/:id", courseHandler.GetCourse)
	}

	// Weather (public)
	weather := v1.Group("/weather")
	{
		weather.GET("/course/:course_id", weatherHandler.GetCourseWeather)
		weather.GET("/course/:course_id/history", weatherHandler.GetCourseWeatherHistory)
	}

	// Equipment (public for viewing)
	equipment := v1.Group("/equipment")
	{
		equipment.GET("", equipmentHandler.GetEquipment)
		equipment.GET("/:id", equipmentHandler.GetEquipmentByID)
	}

	// Range (public for pricing)
	rangePublic := v1.Group("/range")
	{
		rangePublic.GET("/bucket-prices", rangeHandler.GetBucketPrices)
	}

	// Tee times (public for checking availability)
	teeTimesPublic := v1.Group("/tee-times")
	{
		teeTimesPublic.GET("/available", teeTimeHandler.GetAvailableTeeTimes)
	}

	// Protected routes (require authentication)
	protected := v1.Group("")
	protected.Use(middleware.AuthMiddleware(authService))
	{
		// Auth protected routes
		protected.GET("/auth/profile", authHandler.GetProfile)

		// Dashboard
		protected.GET("/dashboard/stats", dashboardHandler.GetDashboardStats)
		protected.GET("/dashboard/activity", dashboardHandler.GetRecentActivity)

		// Tee times
		teeTimes := protected.Group("/tee-times")
		{
			teeTimes.POST("", teeTimeHandler.CreateTeeTime)
			teeTimes.GET("", teeTimeHandler.GetUserTeeTimes)
		}

		// Range sessions
		rangeSessions := protected.Group("/range/sessions")
		{
			rangeSessions.POST("", rangeHandler.BookRangeSession)
			rangeSessions.GET("", rangeHandler.GetUserRangeSessions)
		}

		// Equipment rentals
		equipmentRentals := protected.Group("/equipment/rentals")
		{
			equipmentRentals.POST("", equipmentHandler.RentEquipment)
			equipmentRentals.GET("", equipmentHandler.GetUserRentals)
			equipmentRentals.PUT("/:id/return", equipmentHandler.ReturnEquipment)
		}
	}

	// Admin routes
	admin := v1.Group("/admin")
	admin.Use(middleware.AuthMiddleware(authService))
	admin.Use(middleware.AdminMiddleware())
	{
		// Course Management
		admin.POST("/courses", adminHandler.CreateCourse)
		admin.PUT("/courses/:id", adminHandler.UpdateCourse)
		admin.DELETE("/courses/:id", adminHandler.DeleteCourse)

		// Equipment Management
		admin.POST("/equipment", adminHandler.CreateEquipment)
		admin.PUT("/equipment/:id", adminHandler.UpdateEquipment)
		admin.DELETE("/equipment/:id", adminHandler.DeleteEquipment)

		// User Management
		admin.GET("/users", adminHandler.GetAllUsers)
		admin.PUT("/users/:id", adminHandler.UpdateUser)
		admin.DELETE("/users/:id", adminHandler.DeleteUser)

		// Booking Management
		admin.GET("/bookings", adminHandler.GetAllBookings)
		admin.GET("/rentals", adminHandler.GetAllRentals)

		// Reports and Stats
		admin.GET("/stats", adminHandler.GetAdminStats)
	}

	// Staff routes
	staff := v1.Group("/staff")
	staff.Use(middleware.AuthMiddleware(authService))
	staff.Use(middleware.StaffMiddleware())
	{
		// Equipment management
		staff.PUT("/equipment/:id/status", staffHandler.UpdateEquipmentStatus)

		// Booking management
		staff.PUT("/bookings/:id/status", staffHandler.UpdateBookingStatus)

		// Course management
		staff.PUT("/courses/:id/status", staffHandler.UpdateCourseStatus)

		// Today's operations
		staff.GET("/bookings/today", staffHandler.GetTodaysBookings)
		staff.GET("/rentals/active", staffHandler.GetActiveRentals)

		// Staff stats
		staff.GET("/stats", staffHandler.GetStaffStats)
	}
}
