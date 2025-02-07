package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/utils"
	"time"

	"gorm.io/gorm"
)

func SendDiscordNotification(db *gorm.DB, updateDetails string, scanType string) error {
	var settings models.NotificationSettings
	if err := db.First(&settings).Error; err != nil {
		utils.Logger.Errorf("Failed to retrieve notification settings: %v", err)
		return err
	}
	if settings.WebhookURL == "" {
		utils.Logger.Info("No Discord webhook URL is set; skipping notification.")
		return nil
	}

	type EmbedAuthor struct {
		Name    string `json:"name"`
		IconURL string `json:"icon_url,omitempty"`
	}

	type EmbedFooter struct {
		Text string `json:"text"`
	}

	type Embed struct {
		Title       string      `json:"title"`
		Color       int         `json:"color"`
		Description string      `json:"description"`
		Footer      EmbedFooter `json:"footer"`
		Author      EmbedAuthor `json:"author"`
	}

	type Payload struct {
		Username  string  `json:"username"`
		AvatarURL string  `json:"avatar_url,omitempty"`
		Content   string  `json:"content"`
		Embeds    []Embed `json:"embeds"`
	}

	ping := ""
	switch settings.PingType {
	case "@everyone":
		ping = "@everyone "
	case "@here":
		ping = "@here "
	}

	scanTypeString := "Scheduled Scan"
	if scanType == "Manual" {
		scanTypeString = "Manual Scan"
	} else if scanType == "Test" {
		scanTypeString = "Test Scan"
	}

	currentTime := time.Now().Format("Today at 3:04 PM")

	embed := Embed{
		Title:       "Repository Updates Available",
		Color:       3447003,
		Description: updateDetails,
		Footer: EmbedFooter{
			Text: fmt.Sprintf("%s • %s", scanTypeString, currentTime),
		},
		Author: EmbedAuthor{
			Name:    "Surveillance",
			IconURL: settings.DiscordAvatar,
		},
	}

	payload := Payload{
		Username:  settings.DiscordName,
		AvatarURL: settings.DiscordAvatar,
		Content:   ping,
		Embeds:    []Embed{embed},
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

func SendTestDiscordNotification(db *gorm.DB) error {
	var settings models.NotificationSettings
	if err := db.First(&settings).Error; err != nil {
		utils.Logger.Errorf("Failed to retrieve notification settings: %v", err)
		return err
	}
	if settings.WebhookURL == "" {
		utils.Logger.Info("No Discord webhook URL is set; skipping notification.")
		return nil
	}

	type EmbedAuthor struct {
		Name    string `json:"name"`
		IconURL string `json:"icon_url,omitempty"`
	}

	type EmbedFooter struct {
		Text string `json:"text"`
	}

	type Embed struct {
		Title       string      `json:"title"`
		Color       int         `json:"color"`
		Description string      `json:"description"`
		Footer      EmbedFooter `json:"footer"`
		Author      EmbedAuthor `json:"author"`
	}

	type Payload struct {
		Username  string  `json:"username"`
		AvatarURL string  `json:"avatar_url,omitempty"`
		Content   string  `json:"content"`
		Embeds    []Embed `json:"embeds"`
	}

	exampleUpdates := "- [facebook/react](https://github.com/facebook/react): 2.5.1 → v19.0.0\n"
	scanTypeString := "Test Scan"

	currentTime := time.Now().Format("Today at 3:04 PM")

	ping := ""
	switch settings.PingType {
	case "@everyone":
		ping = "@everyone "
	case "@here":
		ping = "@here "
	}

	embed := Embed{
		Title:       "Repository Updates Available",
		Color:       3447003,
		Description: exampleUpdates,
		Footer: EmbedFooter{
			Text: fmt.Sprintf("%s • %s", scanTypeString, currentTime),
		},
		Author: EmbedAuthor{
			Name:    "Surveillance",
			IconURL: settings.DiscordAvatar,
		},
	}

	payload := Payload{
		Username:  settings.DiscordName,
		AvatarURL: settings.DiscordAvatar,
		Content:   ping,
		Embeds:    []Embed{embed},
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

	utils.Logger.Info("Test Discord notification sent successfully.")
	return nil
}
