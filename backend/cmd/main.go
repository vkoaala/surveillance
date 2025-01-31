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
		})
	}
}

func checkGitHubAPIKey(db *gorm.DB) {
	token := utils.GetGitHubToken(db)
	if token == "" {
		utils.Logger.Info("GitHub API key is not set.")
	}
}

func main() {
	utils.InitLogger()
	db := initDB()

	checkGitHubAPIKey(db)

	e := echo.New()
	c := cron.New()

	var settings models.Settings
	if err := db.First(&settings).Error; err == nil {
		entryID, err := c.AddFunc(settings.CronSchedule, func() {
			githubToken := utils.GetGitHubToken(db)
			nextScanTime := time.Now().Add(6 * time.Hour).Format("Jan 02 3:04 PM")
			services.MonitorRepositories(db, githubToken, nextScanTime, false)
		})
		if err != nil {
			utils.Logger.Fatal("Failed to add cron job: ", err)
		}
		currentCronEntryID = entryID
	}
	c.Start()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{echo.GET, echo.POST, echo.DELETE},
	}))

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
	routes.InitScanRoutes(e, db)

	e.Logger.Fatal(e.Start(":8080"))
}
