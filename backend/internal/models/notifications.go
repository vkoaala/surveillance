package models

import "gorm.io/gorm"

type NotificationSettings struct {
	gorm.Model
	WebhookURL          string
	DiscordName         string
	DiscordAvatar       string
	NotificationMessage string
}
