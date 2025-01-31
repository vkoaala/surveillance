package notifications

import (
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterNotificationRoutes(e *echo.Echo, db *gorm.DB) {
	e.GET("/notifications", func(c echo.Context) error {
		utils.Logger.Debug("Fetching notification settings.")
		var settings models.NotificationSettings
		if err := db.FirstOrCreate(&settings, models.NotificationSettings{
			WebhookURL:          "",
			DiscordName:         "Surveillance Bot",
			DiscordAvatar:       "",
			NotificationMessage: "Surveillance Discord notification: Webhook is working!",
		}).Error; err != nil {
			utils.Logger.Error("Failed to retrieve notification settings: ", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve settings"})
		}
		utils.Logger.Debug("Notification settings retrieved successfully.")
		return c.JSON(http.StatusOK, settings)
	})

	e.POST("/notifications", func(c echo.Context) error {
		utils.Logger.Info("Updating notification settings.")
		var input models.NotificationSettings
		if err := c.Bind(&input); err != nil {
			utils.Logger.Error("Invalid request payload for notification settings.")
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		if err := db.Save(&input).Error; err != nil {
			utils.Logger.Error("Failed to update notification settings: ", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update settings"})
		}
		utils.Logger.Info("Notification settings updated successfully.")
		return c.JSON(http.StatusOK, map[string]string{"message": "Notification settings updated"})
	})
}
