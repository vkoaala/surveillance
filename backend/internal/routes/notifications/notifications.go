package notifications

import (
	"bytes"
	"encoding/json"
	"net/http"
	"surveillance/internal/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterNotificationRoutes(r *echo.Group, db *gorm.DB) {
	r.GET("/notifications", func(c echo.Context) error {
		var settings models.NotificationSettings
		if err := db.First(&settings).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve settings"})
		}
		return c.JSON(http.StatusOK, settings)
	})

	r.POST("/notifications", func(c echo.Context) error {
		var input models.NotificationSettings
		if err := c.Bind(&input); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		var settings models.NotificationSettings
		if err := db.First(&settings).Error; err != nil {
			settings = models.NotificationSettings{
				WebhookURL:          input.WebhookURL,
				DiscordName:         input.DiscordName,
				DiscordAvatar:       input.DiscordAvatar,
				NotificationMessage: input.NotificationMessage,
			}
			if err := db.Create(&settings).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create settings"})
			}
		} else {
			settings.WebhookURL = input.WebhookURL
			settings.DiscordName = input.DiscordName
			settings.DiscordAvatar = input.DiscordAvatar
			settings.NotificationMessage = input.NotificationMessage

			if err := db.Save(&settings).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update settings"})
			}
		}
		return c.JSON(http.StatusOK, map[string]string{"message": "Notification settings updated"})
	})

	r.POST("/notifications/test", func(c echo.Context) error {
		var settings models.NotificationSettings
		if err := db.First(&settings).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve settings"})
		}
		if settings.WebhookURL == "" {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Webhook URL is not set"})
		}
		payload := map[string]interface{}{
			"username":   settings.DiscordName,
			"avatar_url": settings.DiscordAvatar,
			"content":    settings.NotificationMessage + " (Test notification)",
		}
		jsonPayload, err := json.Marshal(payload)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create payload"})
		}
		req, err := http.NewRequest("POST", settings.WebhookURL, bytes.NewBuffer(jsonPayload))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create request"})
		}
		req.Header.Set("Content-Type", "application/json")
		client := http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to send request"})
		}
		defer resp.Body.Close()
		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			return c.JSON(http.StatusOK, map[string]string{"message": "Test notification sent"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Test notification failed"})
	})
}
