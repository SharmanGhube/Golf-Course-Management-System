# 🔒 CRITICAL SECURITY FIXES - Quick Start Guide

## ⚠️ BEFORE DEPLOYING TO PRODUCTION - DO THIS FIRST!

This guide provides step-by-step instructions to fix the most critical security vulnerabilities in 2-3 days.

---

## 🎯 Priority 1: Generate Secure Secrets (30 minutes)

### 1. Generate Strong JWT Secret

```bash
# On Linux/Mac
openssl rand -base64 48

# On Windows PowerShell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[System.Convert]::ToBase64String($bytes)
```

### 2. Generate Strong Database Passwords

```bash
# Generate 32-character password
openssl rand -base64 32
```

### 3. Update backend/.env

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3307
DB_USER=golf_user
DB_PASSWORD=<YOUR_STRONG_PASSWORD_HERE>  # Change this!
DB_NAME=golf_course_db

# JWT Configuration  
JWT_SECRET=<YOUR_GENERATED_SECRET_HERE>  # Change this!
JWT_EXPIRY_HOURS=24

# Server Configuration
PORT=8080
GIN_MODE=release  # Change to 'release' for production!

# Weather API
WEATHER_API_KEY=0b2f50909df047d1aef113049250109

# Frontend URL
FRONTEND_URL=https://yourdomain.com  # Change to your production domain
```

### 4. Update docker-compose.yml

```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: <YOUR_STRONG_ROOT_PASSWORD>  # Change this!
    MYSQL_USER: golf_user
    MYSQL_PASSWORD: <YOUR_STRONG_PASSWORD>  # Same as DB_PASSWORD in .env
```

---

## 🎯 Priority 2: Fix CORS (10 minutes)

### Update backend/internal/middleware/middleware.go

Replace the wildcard CORS with specific domain:

```go
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// SECURITY: Replace with your actual frontend domain
		allowedOrigins := []string{
			"https://yourdomain.com",
			"https://www.yourdomain.com",
		}
		
		origin := c.Request.Header.Get("Origin")
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}
		
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
```

---

## 🎯 Priority 3: Create .gitignore (5 minutes)

Create `.gitignore` in project root:

```gitignore
# Environment files
**/.env
**/.env.local
**/.env.*.local

# Dependencies
node_modules/
vendor/

# Build outputs
.next/
dist/
build/
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test coverage
*.out
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Database
*.sql.gz
mysql_data/

# Uploads
uploads/
temp/
```

**CRITICAL:** Check if .env files were already committed:

```bash
# Check git history for sensitive files
git log --all --full-history -- "**/.env"

# If found, you MUST rotate all secrets immediately!
```

---

## 🎯 Priority 4: Update Docker Images (10 minutes)

### Update backend/Dockerfile

```dockerfile
FROM golang:1.22-alpine3.19 AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage - use latest alpine
FROM alpine:3.19

RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Create uploads directory
RUN mkdir -p uploads

# Run as non-root user
RUN adduser -D -u 1000 appuser
USER appuser

EXPOSE 8080

CMD ["./main"]
```

### Update frontend/Dockerfile

```dockerfile
FROM node:20-alpine3.19 AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## 🎯 Priority 5: Add Rate Limiting (30 minutes)

### Install rate limiting package

```bash
cd backend
go get github.com/ulule/limiter/v3
go get github.com/ulule/limiter/v3/drivers/middleware/gin
go get github.com/ulule/limiter/v3/drivers/store/memory
```

### Create rate limit middleware

Create `backend/internal/middleware/ratelimit.go`:

```go
package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

func RateLimitMiddleware() gin.HandlerFunc {
	// Create a rate limiter: 100 requests per minute
	rate := limiter.Rate{
		Period: 1 * limiter.Minute,
		Limit:  100,
	}
	
	store := memory.NewStore()
	instance := limiter.New(store, rate)
	
	return mgin.NewMiddleware(instance)
}

func AuthRateLimitMiddleware() gin.HandlerFunc {
	// Stricter rate limit for auth endpoints: 5 requests per minute
	rate := limiter.Rate{
		Period: 1 * limiter.Minute,
		Limit:  5,
	}
	
	store := memory.NewStore()
	instance := limiter.New(store, rate)
	
	return mgin.NewMiddleware(instance)
}
```

### Apply rate limiting in routes

Update `backend/internal/routes/routes.go`:

```go
func SetupRoutes(r *gin.Engine, authService *auth.AuthService) {
	// ... existing code ...
	
	// Add global rate limiting
	r.Use(middleware.RateLimitMiddleware())
	
	// ... existing code ...
	
	// Public routes with strict rate limiting on auth
	auth := v1.Group("/auth")
	auth.Use(middleware.AuthRateLimitMiddleware())
	{
		auth.POST("/signup", authHandler.Signup)
		auth.POST("/login", authHandler.Login)
	}
	
	// ... rest of routes ...
}
```

---

## 🎯 Priority 6: Add Security Headers (15 minutes)

### Update backend/internal/middleware/middleware.go

Add security headers middleware:

```go
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent clickjacking
		c.Writer.Header().Set("X-Frame-Options", "DENY")
		
		// Prevent MIME type sniffing
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		
		// Enable XSS protection
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")
		
		// Referrer policy
		c.Writer.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// Content Security Policy (adjust as needed)
		c.Writer.Header().Set("Content-Security-Policy", "default-src 'self'")
		
		// HSTS - only if using HTTPS
		// c.Writer.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		
		c.Next()
	}
}
```

### Apply in routes

```go
func SetupRoutes(r *gin.Engine, authService *auth.AuthService) {
	// Add security headers
	r.Use(middleware.SecurityHeadersMiddleware())
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.RateLimitMiddleware())
	
	// ... rest of code ...
}
```

---

## 🎯 Priority 7: Add Request Size Limits (10 minutes)

### Update backend/main.go

```go
func main() {
	// ... existing code ...
	
	r := gin.Default()
	
	// Limit request body size to 10MB
	r.MaxMultipartMemory = 10 << 20 // 10 MB
	
	// Add middleware to limit request size
	r.Use(func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 10<<20)
		c.Next()
	})
	
	// ... rest of code ...
}
```

---

## 🎯 Priority 8: Add Health Check Endpoint (10 minutes)

### Create backend/internal/handlers/health.go

```go
package handlers

import (
	"net/http"
	"golf-course-backend/internal/database"
	
	"github.com/gin-gonic/gin"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) HealthCheck(c *gin.Context) {
	// Check database connection
	sqlDB, err := database.DB.DB()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "unhealthy",
			"database": "disconnected",
		})
		return
	}
	
	if err := sqlDB.Ping(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "unhealthy",
			"database": "unreachable",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"database": "connected",
	})
}
```

### Add route

```go
// In routes.go
func SetupRoutes(r *gin.Engine, authService *auth.AuthService) {
	// Health check (no auth required)
	healthHandler := handlers.NewHealthHandler()
	r.GET("/health", healthHandler.HealthCheck)
	
	// ... rest of routes ...
}
```

---

## 🎯 Priority 9: Add Docker Health Checks (10 minutes)

### Update docker-compose.yml

```yaml
services:
  mysql:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpassword"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 10s
      timeout: 5s
      retries: 5
```

---

## 🎯 Priority 10: Verify Password Hashing (5 minutes)

### Check backend/internal/auth/auth.go

Ensure bcrypt cost is adequate:

```go
// Make sure cost is at least 12
hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 12)
```

---

## ✅ VERIFICATION CHECKLIST

After completing all steps above:

- [ ] All secrets changed and unique
- [ ] .gitignore created and .env excluded
- [ ] GIN_MODE set to 'release'
- [ ] CORS restricted to specific domain
- [ ] Docker images updated to latest
- [ ] Rate limiting implemented
- [ ] Security headers added
- [ ] Request size limits configured
- [ ] Health checks added
- [ ] Password hashing verified (cost ≥12)

---

## 🚀 REBUILD AND TEST

```bash
# 1. Stop all containers
docker-compose down

# 2. Remove old images
docker system prune -a

# 3. Rebuild with new secure configuration
docker-compose build --no-cache

# 4. Start services
docker-compose up -d

# 5. Check health
curl http://localhost:8080/health

# 6. Test rate limiting
for i in {1..10}; do curl http://localhost:8080/api/v1/courses; done
```

---

## 🔐 FINAL SECURITY NOTES

1. **Never commit .env files** - They're in .gitignore now
2. **Rotate secrets regularly** - At least every 90 days
3. **Monitor logs** - Watch for suspicious activity
4. **Keep dependencies updated** - Run `go get -u` and `npm update` regularly
5. **Use HTTPS in production** - Configure reverse proxy with SSL

---

## 📞 NEED HELP?

If you encounter issues:
1. Check Docker logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Test database connection: `docker exec -it golf_course_db mysql -u golf_user -p`

---

**Completion Time:** 2-3 hours for all fixes  
**Next Steps:** See DEPLOYMENT_READINESS_REPORT.md for additional improvements
