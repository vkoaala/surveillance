package routes

import (
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
			utils.Logger.Error("Failed to retrieve settings.")
			return c.JSON(500, map[string]string{"error": "Failed to retrieve settings"})
		}

		decryptedAPIKey := ""
		if settings.GitHubAPIKey != "" {
			var err error
			decryptedAPIKey, err = utils.DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
			if err != nil {
				utils.Logger.Warn("Decryption failed due to missing or incorrect encryption key.")
			}
		}

		return c.JSON(200, map[string]string{
			"githubApiKey": decryptedAPIKey,
			"cronSchedule": settings.CronSchedule,
			"theme":        settings.Theme,
		})
	})

	e.POST("/settings", func(c echo.Context) error {
		var input struct {
			Theme        string `json:"theme"`
			CronSchedule string `json:"cronSchedule"`
			GitHubAPIKey string `json:"githubApiKey"`
			IsReset      bool   `json:"isReset"`
		}

		if err := c.Bind(&input); err != nil {
			return c.JSON(400, map[string]string{"error": "Invalid request"})
		}

		var settings models.Settings
		if err := db.First(&settings).Error; err != nil {
			return c.JSON(404, map[string]string{"error": "Settings not found"})
		}

		// Handle API key reset or encryption
		if input.IsReset {
			settings.GitHubAPIKey = ""
			utils.Logger.Warn("GitHub API key has been reset.")
		} else if input.GitHubAPIKey != "" && input.GitHubAPIKey != "●●●●●●●●" {
			if err := utils.ValidateGitHubAPIKey(input.GitHubAPIKey); err != nil {
				return c.JSON(400, map[string]string{"error": "Invalid GitHub API key"})
			}
			encryptedKey, _ := utils.EncryptAES(input.GitHubAPIKey, settings.EncryptionKey)
			settings.GitHubAPIKey = encryptedKey
			utils.Logger.Info("Valid GitHub API key saved successfully.")
		}

		// Update other settings
		settings.CronSchedule = ifNotEmpty(input.CronSchedule, settings.CronSchedule)
		settings.Theme = ifNotEmpty(input.Theme, settings.Theme)
		db.Save(&settings)

		return c.JSON(200, map[string]string{"message": "Settings updated successfully"})
	})
}

func ifNotEmpty(value, fallback string) string {
	if value == "" {
		return fallback
	}
	return value
}
