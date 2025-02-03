package notifications

import (
	"net/http"
	"surveillance/internal/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterNotificationRoutes(r *echo.Group, db *gorm.DB) {
	r.GET("/notifications", func(c echo.Context) error {
		var settings models.NotificationSettings
		if err := db.FirstOrCreate(&settings, models.NotificationSettings{
			WebhookURL:          "",
			DiscordName:         "Surveillance Bot",
			DiscordAvatar:       "",
			NotificationMessage: "Surveillance Discord notification: Webhook is working!",
		}).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve settings"})
		}
		return c.JSON(http.StatusOK, settings)
	})
	r.POST("/notifications", func(c echo.Context) error {
		var input models.NotificationSettings
		if err := c.Bind(&input); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}
		if err := db.Save(&input).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update settings"})
		}
		return c.JSON(http.StatusOK, map[string]string{"message": "Notification settings updated"})
	})
}
