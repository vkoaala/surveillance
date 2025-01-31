package main

import (
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
	"gorm.io/gorm/logger"
)

var currentCronEntryID cron.EntryID

func initDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("./db/sqlite.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
	})
	if err != nil {
		utils.Logger.Fatal("Failed to connect to the database: ", err)
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
			LastScan:      "No scan performed yet",
		})
	}
}

func checkGitHubAPIKey(db *gorm.DB) {
	token := utils.GetGitHubToken(db)
	if token == "" {
		utils.Logger.Info("GitHub API key is not set.")
	}
}

func startCronJob(db *gorm.DB, scheduler *cron.Cron) {
	var settings models.Settings
	if err := db.First(&settings).Error; err != nil {
		utils.Logger.Fatalf("Failed to fetch initial settings: %v", err)
	}

	entryID, err := scheduler.AddFunc(settings.CronSchedule, func() {
		utils.Logger.Info("Cron job triggered: Starting repository scan...")
		githubToken := utils.GetGitHubToken(db)
		nextScanTime := time.Now().Add(6 * time.Hour).Format("Jan 02 3:04 PM")
		err := services.MonitorRepositories(db, githubToken, nextScanTime, false)
		if err != nil {
			utils.Logger.Errorf("Repository scan failed: %v", err)
		} else {
			utils.Logger.Info("Repository scan completed successfully.")
		}
	})
	if err != nil {
		utils.Logger.Fatalf("Failed to schedule the cron job: %v", err)
	}
	currentCronEntryID = entryID
	utils.Logger.Infof("Cron job scheduled with ID: %d and schedule: %s", entryID, settings.CronSchedule)
}

func main() {
	utils.InitLogger()
	db := initDB()
	checkGitHubAPIKey(db)
	scheduler := cron.New()
	startCronJob(db, scheduler)
	scheduler.Start()

	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
	}))

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			ctx.Set("db", db)
			ctx.Set("cron", scheduler)
			return next(ctx)
		}
	})

	routes.InitRepositoryRoutes(e, db)
	routes.InitSettingsRoutes(e, db, scheduler, &currentCronEntryID)
	routes.InitNotificationRoutes(e, db)
	routes.InitValidationRoutes(e)
	routes.InitScanRoutes(e, db)

	e.Logger.Fatal(e.Start(":8080"))
}
