package handlers

import (
	"net/http"
	"runtime"
	"time"

	"golf-course-backend/internal/database"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Version   string            `json:"version"`
	Services  map[string]string `json:"services"`
	System    SystemInfo        `json:"system"`
}

type SystemInfo struct {
	GoVersion    string `json:"go_version"`
	NumGoroutine int    `json:"num_goroutine"`
	NumCPU       int    `json:"num_cpu"`
}

// HealthCheck provides a comprehensive health check endpoint
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now().Format(time.RFC3339),
		Version:   "1.0.0", // Update this with actual version
		Services:  make(map[string]string),
		System: SystemInfo{
			GoVersion:    runtime.Version(),
			NumGoroutine: runtime.NumGoroutine(),
			NumCPU:       runtime.NumCPU(),
		},
	}

	// Check database connection
	sqlDB, err := database.DB.DB()
	if err != nil {
		response.Status = "unhealthy"
		response.Services["database"] = "error: " + err.Error()
		c.JSON(http.StatusServiceUnavailable, response)
		return
	}

	if err := sqlDB.Ping(); err != nil {
		response.Status = "unhealthy"
		response.Services["database"] = "unreachable: " + err.Error()
		c.JSON(http.StatusServiceUnavailable, response)
		return
	}

	response.Services["database"] = "healthy"

	c.JSON(http.StatusOK, response)
}

// ReadinessCheck provides a simple ready/not-ready check
func (h *HealthHandler) ReadinessCheck(c *gin.Context) {
	// Check if database is accessible
	sqlDB, err := database.DB.DB()
	if err != nil || sqlDB.Ping() != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"ready": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ready": true,
	})
}

// LivenessCheck provides a simple alive check (always returns 200 if service is running)
func (h *HealthHandler) LivenessCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"alive": true,
	})
}
