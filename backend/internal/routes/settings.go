package routes

import (
	"log"
	"net/http"
	"surveillance/internal/models"
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

		decryptedAPIKey := ""
		if settings.GitHubAPIKey != "" {
			decrypted, err := utils.DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
			if err == nil {
				decryptedAPIKey = decrypted
			}
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
			IsReset      bool   `json:"isReset"` // To track if reset button was pressed
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

		// Handle API key logic
		if newSettings.IsReset {
			settings.GitHubAPIKey = "" // Clear the saved key
			log.Println("⚠️  GitHub API key cleared via reset button.")
		} else if newSettings.GitHubAPIKey != "" && newSettings.GitHubAPIKey != "●●●●●●●●" {
			// If a new API key is provided, validate and save it
			if err := utils.ValidateGitHubAPIKey(newSettings.GitHubAPIKey); err != nil {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid GitHub API key"})
			}

			// Encrypt and save the validated key
			encryptedAPIKey, err := utils.EncryptAES(newSettings.GitHubAPIKey, settings.EncryptionKey)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to encrypt API key"})
			}
			settings.GitHubAPIKey = encryptedAPIKey
			log.Println("✅ GitHub API key validated and saved.")
		}

		// Update cron and theme if provided
		if newSettings.CronSchedule != "" {
			settings.CronSchedule = newSettings.CronSchedule
		}
		if newSettings.Theme != "" {
			settings.Theme = newSettings.Theme
		}

		if err := db.Save(&settings).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save settings"})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "Settings updated successfully"})
	})
}
