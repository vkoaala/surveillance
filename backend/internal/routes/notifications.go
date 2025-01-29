package routes

import (
	"net/http"
	"surveillance/internal/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func InitNotificationRoutes(e *echo.Echo, db *gorm.DB) {

	e.GET("/notifications", func(c echo.Context) error {
		var count int64
		db.Model(&models.NotificationSettings{}).Count(&count)

		if count == 0 {
			settings := models.NotificationSettings{
				WebhookURL:          "",
				DiscordName:         "Surveillance Bot",
				DiscordAvatar:       "",
				NotificationMessage: "Surveillance notification: Webhook is working!",
			}
			db.Create(&settings)
			return c.JSON(http.StatusOK, settings)
		}

		var settings models.NotificationSettings
		db.First(&settings)
		return c.JSON(http.StatusOK, settings)
	})

	e.POST("/notifications", func(c echo.Context) error {
		var newSettings models.NotificationSettings
		if err := c.Bind(&newSettings); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		var settings models.NotificationSettings
		db.First(&settings)

		settings.WebhookURL = newSettings.WebhookURL
		settings.DiscordName = newSettings.DiscordName
		settings.DiscordAvatar = newSettings.DiscordAvatar
		settings.NotificationMessage = newSettings.NotificationMessage

		db.Save(&settings)
		return c.JSON(http.StatusOK, map[string]string{"message": "Notification settings updated"})
	})
}
