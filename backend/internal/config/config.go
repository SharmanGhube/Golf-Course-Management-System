package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Database DatabaseConfig
	JWT      JWTConfig
	Server   ServerConfig
	Stripe   StripeConfig
	Weather  WeatherConfig
	Email    EmailConfig
	Upload   UploadConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	DSN      string
}

type JWTConfig struct {
	Secret      string
	ExpiryHours int
}

type ServerConfig struct {
	Port        string
	GinMode     string
	FrontendURL string
}

type StripeConfig struct {
	SecretKey      string
	PublishableKey string
	WebhookSecret  string
}

type WeatherConfig struct {
	APIKey string
	APIURL string
}

type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
}

type UploadConfig struct {
	MaxSize int64
	Path    string
}

func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config := &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "3306"),
			User:     getEnv("DB_USER", "golf_user"),
			Password: getEnv("DB_PASSWORD", "golf_password"),
			Name:     getEnv("DB_NAME", "golf_course_db"),
		},
		JWT: JWTConfig{
			Secret:      getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
			ExpiryHours: getEnvAsInt("JWT_EXPIRY_HOURS", 24),
		},
		Server: ServerConfig{
			Port:        getEnv("PORT", "8080"),
			GinMode:     getEnv("GIN_MODE", "debug"),
			FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
		},
		Stripe: StripeConfig{
			SecretKey:      getEnv("STRIPE_SECRET_KEY", ""),
			PublishableKey: getEnv("STRIPE_PUBLISHABLE_KEY", ""),
			WebhookSecret:  getEnv("STRIPE_WEBHOOK_SECRET", ""),
		},
		Weather: WeatherConfig{
			APIKey: getEnv("WEATHER_API_KEY", ""),
			APIURL: getEnv("WEATHER_API_URL", "https://api.weatherapi.com/v1"),
		},
		Email: EmailConfig{
			SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
			SMTPPort:     getEnv("SMTP_PORT", "587"),
			SMTPUsername: getEnv("SMTP_USERNAME", ""),
			SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		},
		Upload: UploadConfig{
			MaxSize: getEnvAsInt64("MAX_UPLOAD_SIZE", 10485760), // 10MB
			Path:    getEnv("UPLOAD_PATH", "./uploads"),
		},
	}

	// Build database DSN based on DB_TYPE
	dbType := getEnv("DB_TYPE", "mysql")
	if dbType == "postgres" || dbType == "postgresql" {
		// PostgreSQL DSN format
		config.Database.DSN = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require TimeZone=UTC",
			config.Database.Host,
			config.Database.User,
			config.Database.Password,
			config.Database.Name,
			config.Database.Port,
		)
	} else {
		// MySQL DSN format (default)
		config.Database.DSN = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			config.Database.User,
			config.Database.Password,
			config.Database.Host,
			config.Database.Port,
			config.Database.Name,
		)
	}

	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}
