package cron

import (
	"surveillance/internal/models"
	"surveillance/internal/services"
	"surveillance/internal/utils"

	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

func StartScheduler(db *gorm.DB) (*cron.Cron, cron.EntryID) {
	scheduler := cron.New()

	var settings struct {
		CronSchedule string `gorm:"column:cron_schedule"`
	}
	if err := db.Table("settings").First(&settings).Error; err != nil {
		utils.Logger.Fatalf("Failed to fetch settings for cron: %v", err)
	}

	jobID, err := scheduler.AddFunc(settings.CronSchedule, func() {
		var reposCount int64
		if err := db.Model(&models.Repository{}).Count(&reposCount).Error; err != nil {
			utils.Logger.Errorf("Failed to fetch repositories count: %v", err)
			return
		}

		githubToken := utils.GetGitHubToken(db)
		if err := services.MonitorRepositories(db, githubToken, "Scheduled", false); err != nil {
			utils.Logger.Errorf("Repository scan failed: %v", err)
		}
	})
	if err != nil {
		utils.Logger.Fatalf("Failed to schedule cron job: %v", err)
	}

	utils.Logger.Infof("Cron job scheduled with ID: %d and schedule: %s", jobID, settings.CronSchedule)
	scheduler.Start()
	return scheduler, jobID
}
