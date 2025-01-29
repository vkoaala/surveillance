package main

import (
	"log"
	"surveillance/internal/models"
	"surveillance/internal/routes"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/robfig/cron/v3"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func initDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("./db/sqlite.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ [DB ERROR] Failed to connect: %v", err)
	}

	db.AutoMigrate(&models.Settings{})
	db.AutoMigrate(&models.Repository{})
	db.AutoMigrate(&models.NotificationSettings{})

	ensureDefaultSettings(db)

	return db
}

func ensureDefaultSettings(db *gorm.DB) {
	var count int64
	db.Model(&models.Settings{}).Count(&count)

	if count == 0 {
		settings := models.Settings{
			Theme:         "tokyoNight",
			CronSchedule:  "@every 6h",
			GitHubAPIKey:  "",
			EncryptionKey: utils.GenerateEncryptionKey(),
		}
		db.Create(&settings)
		log.Println("✅ [Settings] Default settings created.")
	}
}

func main() {
	e := echo.New()
	db := initDB()
	c := cron.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{echo.GET, echo.POST, echo.DELETE},
	}))

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("db", db)
			return next(c)
		}
	})

	routes.InitRepositoryRoutes(e, db)
	routes.InitSettingsRoutes(e, db, c)
	routes.InitNotificationRoutes(e, db)

	e.Logger.Fatal(e.Start(":8080"))
}
