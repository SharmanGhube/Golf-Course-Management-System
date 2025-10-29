package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

// RateLimitMiddleware creates a general rate limiter
// Default: 100 requests per minute per IP
func RateLimitMiddleware() gin.HandlerFunc {
	rate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  100,
	}

	store := memory.NewStore()
	instance := limiter.New(store, rate, limiter.WithTrustForwardHeader(true))

	return mgin.NewMiddleware(instance)
}

// AuthRateLimitMiddleware creates a strict rate limiter for authentication endpoints
// Limit: 5 requests per minute per IP to prevent brute force attacks
func AuthRateLimitMiddleware() gin.HandlerFunc {
	rate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  5,
	}

	store := memory.NewStore()
	instance := limiter.New(store, rate, limiter.WithTrustForwardHeader(true))

	middleware := mgin.NewMiddleware(instance)

	// Wrap to customize error message
	return func(c *gin.Context) {
		middleware(c)

		// Check if rate limit was exceeded
		if c.Writer.Status() == http.StatusTooManyRequests {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "Too many login attempts. Please try again in 60 seconds.",
				"retry_after": 60,
			})
		}
	}
}

// PublicRateLimitMiddleware creates a rate limiter for public endpoints
// More permissive: 200 requests per minute
func PublicRateLimitMiddleware() gin.HandlerFunc {
	rate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  200,
	}

	store := memory.NewStore()
	instance := limiter.New(store, rate, limiter.WithTrustForwardHeader(true))

	return mgin.NewMiddleware(instance)
}
