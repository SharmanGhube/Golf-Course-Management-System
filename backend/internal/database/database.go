package database

import (
	"fmt"
	"golf-course-backend/internal/config"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Initialize(cfg *config.Config) error {
	var err error

	// Configure GORM logger
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Determine database type from environment or default to MySQL
	dbType := os.Getenv("DB_TYPE")
	if dbType == "" {
		dbType = "mysql" // Default to MySQL for backward compatibility
	}

	// Connect based on database type
	switch dbType {
	case "postgres", "postgresql":
		DB, err = gorm.Open(postgres.Open(cfg.Database.DSN), gormConfig)
		if err != nil {
			return fmt.Errorf("failed to connect to PostgreSQL: %w", err)
		}
		log.Println("✅ Connected to PostgreSQL database")
	case "mysql":
		DB, err = gorm.Open(mysql.Open(cfg.Database.DSN), gormConfig)
		if err != nil {
			return fmt.Errorf("failed to connect to MySQL: %w", err)
		}
		log.Println("✅ Connected to MySQL database")
	default:
		return fmt.Errorf("unsupported database type: %s (use 'mysql' or 'postgres')", dbType)
	}

	// Configure connection pool
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool settings from environment or defaults
	maxIdleConns := 10
	maxOpenConns := 100
	if envMaxIdle := os.Getenv("DB_MAX_IDLE_CONNS"); envMaxIdle != "" {
		fmt.Sscanf(envMaxIdle, "%d", &maxIdleConns)
	}
	if envMaxOpen := os.Getenv("DB_MAX_OPEN_CONNS"); envMaxOpen != "" {
		fmt.Sscanf(envMaxOpen, "%d", &maxOpenConns)
	}

	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)

	log.Printf("✅ Database connection pool configured: MaxIdle=%d, MaxOpen=%d", maxIdleConns, maxOpenConns)

	// Skip auto-migration since we have complete schema in init.sql
	// This avoids foreign key conflicts with existing schema
	/*
		err = DB.AutoMigrate(
			&models.User{},
			&models.Course{},
			&models.Hole{},
			&models.TeeTime{},
			&models.RangeSession{},
			&models.Equipment{},
			&models.EquipmentRental{},
			&models.Scorecard{},
			&models.ScorecardHole{},
			&models.Payment{},
			&models.WeatherLog{},
			&models.SystemSetting{},
		)
		if err != nil {
			return err
		}
	*/

	log.Println("Database connection established and migrations completed")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
