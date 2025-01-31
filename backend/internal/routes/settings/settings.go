package settings

import (
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/services"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

func RegisterSettingsRoutes(e *echo.Echo, db *gorm.DB, scheduler *cron.Cron, jobID *cron.EntryID) {
	e.GET("/settings", func(c echo.Context) error {
		var settings models.Settings
		if err := db.First(&settings).Error; err != nil {
			utils.Logger.Error("Failed to retrieve settings: ", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve settings"})
		}
		decryptedAPIKey := ""
		if settings.GitHubAPIKey != "" {
			var err error
			decryptedAPIKey, err = utils.DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
			if err != nil {
				utils.Logger.Warn("Decryption failed: ", err)
			}
		}
		return c.JSON(http.StatusOK, map[string]string{
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
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}
		if !isValidCronExpression(input.CronSchedule) {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid cron expression"})
		}
		var settings models.Settings
		if err := db.First(&settings).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve settings"})
		}
		settingsUpdated := false

		if settings.CronSchedule != input.CronSchedule {
			scheduler.Remove(*jobID)
			newJobID, err := scheduler.AddFunc(input.CronSchedule, func() {
				githubToken := utils.GetGitHubToken(db)
				if err := services.MonitorRepositories(db, githubToken, "", false); err != nil {
					utils.Logger.Errorf("Repository scan failed: %v", err)
				}
			})
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to schedule the new cron job"})
			}
			*jobID = newJobID
			settings.CronSchedule = input.CronSchedule
			settingsUpdated = true
			utils.Logger.Infof("🕒 Cron job updated with new schedule: %s", input.CronSchedule)
		}

		if input.IsReset {
			settings.GitHubAPIKey = ""
			settingsUpdated = true
			utils.Logger.Warn("🔑 GitHub API key has been reset.")
		} else if input.GitHubAPIKey != "●●●●●●●●" && input.GitHubAPIKey != "" {
			if err := utils.ValidateGitHubAPIKey(input.GitHubAPIKey); err != nil {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid GitHub API key"})
			}
			encryptedKey, err := utils.EncryptAES(input.GitHubAPIKey, settings.EncryptionKey)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Encryption failed"})
			}
			settings.GitHubAPIKey = encryptedKey
			settingsUpdated = true
			utils.Logger.Info("✅ New GitHub API key validated and saved.")
		}

		if settingsUpdated {
			if err := db.Save(&settings).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update settings"})
			}
		}

		return c.JSON(http.StatusOK, map[string]string{})
	})
}

func isValidCronExpression(cronExpr string) bool {
	_, err := cron.ParseStandard(cronExpr)
	return err == nil
}
