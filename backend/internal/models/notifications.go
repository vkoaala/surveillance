package models

import "gorm.io/gorm"

type NotificationSettings struct {
	gorm.Model
	WebhookURL          string `json:"webhookUrl"`
	DiscordName         string `json:"discordName"`
	DiscordAvatar       string `json:"discordAvatar"`
	NotificationMessage string `json:"notificationMessage"`
}
