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

func RegisterSettingsRoutes(e *echo.Group, db *gorm.DB, scheduler *cron.Cron, jobID *cron.EntryID) {
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
		} else if input.GitHubAPIKey != "" && input.GitHubAPIKey != "●●●●●●●●" {
			if err := utils.ValidateGitHubAPIKey(input.GitHubAPIKey); err == nil {
				encryptedKey, err := utils.EncryptAES(input.GitHubAPIKey, settings.EncryptionKey)
				if err == nil {
					settings.GitHubAPIKey = encryptedKey
					settingsUpdated = true
					utils.Logger.Info("✅ New GitHub API key validated and saved.")
				} else {
					utils.Logger.Error("Encryption failed: ", err)
				}
			} else {
				utils.Logger.Warn("Provided GitHub API key is invalid, skipping API key update.")
			}
		}
		if settings.Theme != input.Theme {
			settings.Theme = input.Theme
			settingsUpdated = true
		}
		if settingsUpdated {
			if err := db.Save(&settings).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update settings"})
			}
		}
		return c.JSON(http.StatusOK, map[string]string{"message": "Settings updated successfully"})
	})
}

func loadOrCreateSettings(db *gorm.DB) (models.Settings, error) {
	var settings models.Settings
	err := db.First(&settings).Error
	if err == gorm.ErrRecordNotFound {
		settings = models.Settings{
			Theme:        "tokyoNight",
			CronSchedule: "0 */12 * * *",
		}
		err = db.Create(&settings).Error
	}
	return settings, err
}

func decryptGitHubKey(settings *models.Settings) string {
	if settings.GitHubAPIKey == "" {
		return ""
	}
	decryptedKey, err := utils.DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
	if err != nil {
		return ""
	}
	return decryptedKey
}

func updateCronSchedule(newSchedule string, scheduler *cron.Cron, jobID *cron.EntryID, db *gorm.DB) error {
	scheduler.Remove(*jobID)
	newJobID, err := scheduler.AddFunc(newSchedule, func() {
		githubToken := utils.GetGitHubToken(db)
		services.MonitorRepositories(db, githubToken, "", false)
	})
	if err != nil {
		return err
	}
	*jobID = newJobID
	return nil
}

func handleGitHubKeyUpdate(newKey string, settings *models.Settings) error {
	if err := utils.ValidateGitHubAPIKey(newKey); err != nil {
		return err
	}
	encryptedKey, err := utils.EncryptAES(newKey, settings.EncryptionKey)
	if err != nil {
		return err
	}
	settings.GitHubAPIKey = encryptedKey
	return nil
}

func isValidCronExpression(cronExpr string) bool {
	_, err := cron.ParseStandard(cronExpr)
	return err == nil
}
