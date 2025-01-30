package main

import (
	"log"
	"surveillance/internal/models"
	"surveillance/internal/routes"
	"surveillance/internal/services"
	"surveillance/internal/utils"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/robfig/cron/v3"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var currentCronEntryID cron.EntryID

func initDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("./db/sqlite.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Failed to connect DB: %v", err)
	}
	db.AutoMigrate(&models.Settings{}, &models.Repository{}, &models.NotificationSettings{})
	ensureDefaultSettings(db)
	return db
}

func ensureDefaultSettings(db *gorm.DB) {
	var count int64
	db.Model(&models.Settings{}).Count(&count)
	if count == 0 {
		db.Create(&models.Settings{
			Theme:         "tokyoNight",
			CronSchedule:  "0 */12 * * *",
			GitHubAPIKey:  "",
			EncryptionKey: utils.GenerateEncryptionKey(),
		})
		log.Println("[Settings] Default settings created.")
	}
}

func main() {
	e := echo.New()
	db := initDB()
	c := cron.New()

	// Load settings for initial schedule setup
	var settings models.Settings
	if err := db.First(&settings).Error; err == nil {
		entryID, err := c.AddFunc(settings.CronSchedule, func() {
			log.Println("🔄 Running scheduled repository scan...")
			githubToken := utils.GetGitHubToken(db)
			nextScanTime := time.Now().Add(6 * time.Hour).Format("Jan 02 3:04 PM")
			services.MonitorRepositories(db, githubToken, nextScanTime, false) // Scheduled scan
		})

		if err == nil {
			currentCronEntryID = entryID
			log.Printf("✅ Scheduled repo scan with cron: %s", settings.CronSchedule)
		}
	}

	c.Start()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{echo.GET, echo.POST, echo.DELETE},
	}))

	// Inject DB and cron into the request context
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			ctx.Set("db", db)
			ctx.Set("cron", c)
			return next(ctx)
		}
	})

	routes.InitRepositoryRoutes(e, db)
	routes.InitSettingsRoutes(e, db, c, &currentCronEntryID)
	routes.InitNotificationRoutes(e, db)
	routes.InitValidationRoutes(e)

	log.Println("✅ Server starting at http://localhost:8080")
	e.Logger.Fatal(e.Start(":8080"))
}
