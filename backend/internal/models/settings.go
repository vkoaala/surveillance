package models

import (
	"gorm.io/gorm"
)

type Settings struct {
	gorm.Model
	EncryptionKey string
	GitHubAPIKey  string
	CronSchedule  string
	Theme         string
}
