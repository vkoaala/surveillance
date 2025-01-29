package routes

import (
	"log"
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/services"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

func InitSettingsRoutes(e *echo.Echo, db *gorm.DB, scheduler *cron.Cron, jobID *cron.EntryID) {
	e.GET("/settings", func(c echo.Context) error {
		var settings models.Settings
		if err := db.First(&settings).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve settings"})
		}
		if settings.GitHubAPIKey == "" {
			return c.JSON(http.StatusOK, map[string]string{
				"githubApiKey": "",
				"cronSchedule": settings.CronSchedule,
				"theme":        settings.Theme,
			})
		}
		decryptedAPIKey, err := utils.DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
		if err != nil {
			decryptedAPIKey = ""
		}
		return c.JSON(http.StatusOK, map[string]string{
			"githubApiKey": decryptedAPIKey,
			"cronSchedule": settings.CronSchedule,
			"theme":        settings.Theme,
		})
	})

	e.POST("/settings", func(c echo.Context) error {
		var newSettings struct {
			Theme        string `json:"theme"`
			CronSchedule string `json:"cronSchedule"`
			GitHubAPIKey string `json:"githubApiKey"`
		}
		if err := c.Bind(&newSettings); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}
		var settings models.Settings
		if err := db.First(&settings).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "No settings found"})
		}
		if settings.EncryptionKey == "" {
			settings.EncryptionKey = utils.GenerateEncryptionKey()
			db.Save(&settings)
		}
		if newSettings.GitHubAPIKey != "" {
			encryptedAPIKey, err := utils.EncryptAES(newSettings.GitHubAPIKey, settings.EncryptionKey)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to encrypt API key"})
			}
			settings.GitHubAPIKey = encryptedAPIKey
		}
		scheduleUpdated := false
		if newSettings.CronSchedule != "" && newSettings.CronSchedule != settings.CronSchedule {
			settings.CronSchedule = newSettings.CronSchedule
			scheduleUpdated = true
		}
		if newSettings.Theme != "" && newSettings.Theme != settings.Theme {
			settings.Theme = newSettings.Theme
		}
		if err := db.Save(&settings).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save settings"})
		}
		if scheduleUpdated {
			scheduler.Stop()
			if *jobID != 0 {
				scheduler.Remove(*jobID)
			}
			newID, err := scheduler.AddFunc(settings.CronSchedule, func() {
				log.Println("Running scheduled repository scan...")
				services.MonitorRepositories(db)
			})
			if err != nil {
				scheduler.Start()
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update cron schedule"})
			}
			*jobID = newID
			scheduler.Start()
			log.Printf("Cron schedule updated to: %s", settings.CronSchedule)
		}
		return c.JSON(http.StatusOK, map[string]string{"message": "Settings updated"})
	})
}
