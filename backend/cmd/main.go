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
		log.Fatalf("🔥 [Database] Failed to connect: %v", err)
	}

	log.Println("✅ [Database] Connected successfully.")
	db.AutoMigrate(&models.Settings{})
	db.AutoMigrate(&models.Repository{})

	ensureDefaultSettings(db)

	return db
}

func ensureDefaultSettings(db *gorm.DB) {
	var settings models.Settings
	if err := db.First(&settings).Error; err != nil {
		log.Println("⚠️ [Settings] No settings found. Creating default settings...")
		settings = models.Settings{
			Theme:         "tokyoNight",
			CronSchedule:  "@every 6h",
			GitHubAPIKey:  "",
			EncryptionKey: utils.GenerateEncryptionKey(),
		}
		db.Create(&settings)
		log.Println("✅ [Settings] Default settings created.")
	}

	if settings.EncryptionKey == "" {
		log.Println("⚠️ [Settings] Encryption key missing. Generating new key...")
		settings.EncryptionKey = utils.GenerateEncryptionKey()
		db.Save(&settings)
		log.Println("✅ [Settings] Encryption key updated.")
	}
}

func main() {
	log.Println("🚀 [Server] Starting Surveillance Backend...")
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{echo.GET, echo.POST, echo.DELETE},
	}))

	db := initDB()
	c := cron.New()

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("db", db)
			return next(c)
		}
	})

	routes.InitRepositoryRoutes(e, db, c)
	routes.InitSettingsRoutes(e, db)

	log.Println("✅ [Server] Running on http://localhost:8080")
	e.Logger.Fatal(e.Start(":8080"))
}
