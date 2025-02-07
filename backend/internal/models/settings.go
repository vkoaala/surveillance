package models

import "gorm.io/gorm"

type Settings struct {
	gorm.Model
	GitHubAPIKey string
	CronSchedule string
	Theme        string
	LastScan     string
}
