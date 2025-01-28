package main

import (
	"log"
	"os"
	"surveillance/internal/models"
	"surveillance/internal/routes"
	"surveillance/internal/services"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/robfig/cron/v3"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func initDB() *gorm.DB {
	if err := os.MkdirAll("./db", os.ModePerm); err != nil {
		log.Fatalf("Failed to create db directory: %v", err)
	}

	db, err := gorm.Open(sqlite.Open("./db/sqlite.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	db.AutoMigrate(&models.Repository{})
	return db
}

func main() {
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{echo.GET, echo.POST, echo.DELETE},
	}))

	db := initDB()

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("db", db)
			return next(c)
		}
	})

	// Initialize routes
	routes.InitRepositoryRoutes(e)

	// Initialize cron job with dynamic schedule
	c := cron.New()
	c.AddFunc("@every 5m", func() { services.MonitorRepositories(db) }) // Default schedule
	go c.Start()

	// Start the server
	e.Logger.Fatal(e.Start(":8080"))
}
