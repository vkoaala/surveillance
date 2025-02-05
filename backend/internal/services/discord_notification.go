package services

import (
	"bytes"
	"encoding/json"
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/utils"

	"gorm.io/gorm"
)

func SendDiscordNotification(db *gorm.DB, updateDetails string) error {
	var settings models.NotificationSettings
	if err := db.First(&settings).Error; err != nil {
		utils.Logger.Errorf("Failed to retrieve notification settings: %v", err)
		return err
	}
	if settings.WebhookURL == "" {
		utils.Logger.Info("No Discord webhook URL is set; skipping notification.")
		return nil
	}
	payload := map[string]interface{}{
		"username":   settings.DiscordName,
		"avatar_url": settings.DiscordAvatar,
		"content":    settings.NotificationMessage + "\n" + updateDetails,
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		utils.Logger.Errorf("Failed to marshal Discord payload: %v", err)
		return err
	}
	req, err := http.NewRequest("POST", settings.WebhookURL, bytes.NewBuffer(jsonPayload))
	if err != nil {
		utils.Logger.Errorf("Failed to create Discord notification request: %v", err)
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		utils.Logger.Errorf("Failed to send Discord notification: %v", err)
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		utils.Logger.Errorf("Discord notification failed with status: %d", resp.StatusCode)
		return err
	}
	utils.Logger.Info("Discord notification sent successfully.")
	return nil
}
