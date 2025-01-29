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

func InitSettingsRoutes(e *echo.Echo, db *gorm.DB, scheduler *cron.Cron) {

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

		if settings.GitHubAPIKey == "" {
			return c.JSON(http.StatusOK, map[string]string{
				"githubApiKey": "",
				"cronSchedule": settings.CronSchedule,
				"theme":        settings.Theme,
			})
		}

		decryptedAPIKey, err := utils.DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
		if err != nil {
			log.Println("❌ [Settings] Failed to decrypt API key:", err)
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

		if newSettings.GitHubAPIKey != "" {
			encryptedAPIKey, err := utils.EncryptAES(newSettings.GitHubAPIKey, settings.EncryptionKey)
			if err != nil {
				log.Println("❌ [Settings] Failed to encrypt API key:", err)
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to encrypt API key"})
			}
			settings.GitHubAPIKey = encryptedAPIKey
		}

		if newSettings.CronSchedule != "" {
			settings.CronSchedule = newSettings.CronSchedule
		}

		if newSettings.Theme != "" {
			settings.Theme = newSettings.Theme
		}

		db.Save(&settings)
		return c.JSON(http.StatusOK, map[string]string{"message": "Settings updated"})
	})

	e.POST("/update-cron", func(c echo.Context) error {
		var payload struct {
			Cron string `json:"cron"`
		}

		if err := c.Bind(&payload); err != nil {
			log.Println("❌ Invalid cron update request received")
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		log.Printf("🔄 Updating cron schedule to: %s", payload.Cron)

		scheduler.Stop()

		entryID, err := scheduler.AddFunc(payload.Cron, func() {
			log.Println("🔄 Running scheduled repository scan...")
			// Call the repository scan function
		})
		if err != nil {
			log.Printf("❌ Failed to set new cron schedule: %s | Error: %v", payload.Cron, err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update cron schedule"})
		}
		scheduler.Start()

		nextRun := "N/A"
		entries := scheduler.Entries()
		for _, entry := range entries {
			if entry.ID == entryID {
				nextRun = entry.Next.Format("Jan 02 2006 15:04:05")
				break
			}
		}

		log.Printf("🔄 Cron schedule updated: Running every %s...\n⏭️ Next run: %s", payload.Cron, nextRun)

		return c.JSON(http.StatusOK, map[string]string{"message": "Cron schedule updated successfully!"})
	})
}
