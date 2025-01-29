package routes

import (
	"log"
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func InitSettingsRoutes(e *echo.Echo, db *gorm.DB) {
	e.GET("/settings", func(c echo.Context) error {
		var settings models.Settings
		if err := db.First(&settings).Error; err != nil {
			log.Println("⚠️ [Settings] No settings found, initializing default settings.")
			settings = models.Settings{
				Theme:         "tokyoNight",
				CronSchedule:  "@every 6h",
				GitHubAPIKey:  "",
				EncryptionKey: utils.GenerateEncryptionKey(),
			}
			db.Create(&settings)
		}

		if settings.EncryptionKey == "" {
			log.Println("⚠️ [Settings] Encryption key is missing. Generating new key...")
			settings.EncryptionKey = utils.GenerateEncryptionKey()
			db.Save(&settings)
		}

		decryptedAPIKey, err := utils.DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
		if err != nil {
			log.Println("❌ [Settings] Failed to decrypt API key:", err)
			decryptedAPIKey = ""
		}

		// 🚀 Removed excessive logging here
		return c.JSON(http.StatusOK, map[string]string{
			"githubApiKey": decryptedAPIKey,
			"cronSchedule": settings.CronSchedule,
			"theme":        settings.Theme,
		})
	})

	e.POST("/settings", func(c echo.Context) error {
		var newSettings models.Settings
		if err := c.Bind(&newSettings); err != nil {
			log.Println("❌ [Settings] Invalid request:", err)
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		var settings models.Settings
		db.First(&settings)

		if settings.EncryptionKey == "" {
			log.Println("⚠️ [Settings] Encryption key is missing. Generating new key...")
			settings.EncryptionKey = utils.GenerateEncryptionKey()
			db.Save(&settings)
		}

		encryptedAPIKey, err := utils.EncryptAES(newSettings.GitHubAPIKey, settings.EncryptionKey)
		if err != nil {
			log.Println("❌ [Settings] Failed to encrypt API key:", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to encrypt API key"})
		}

		settings.GitHubAPIKey = encryptedAPIKey
		settings.CronSchedule = newSettings.CronSchedule
		settings.Theme = newSettings.Theme

		db.Save(&settings)
		return c.JSON(http.StatusOK, map[string]string{"message": "Settings updated"})
	})
}
