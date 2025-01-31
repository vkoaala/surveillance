package database

import (
	"surveillance/internal/models"
	"surveillance/internal/utils"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("./db/sqlite.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
	})
	if err != nil {
		utils.Logger.Fatal("Failed to connect to the database: ", err)
	}

	db.AutoMigrate(&models.Settings{}, &models.Repository{}, &models.NotificationSettings{})

	ensureDefaultSettings(db)
	return db
}

func ensureDefaultSettings(db *gorm.DB) {
	var count int64
	db.Model(&models.Settings{}).Count(&count)
	if count == 0 {
		db.Create(&models.Settings{
			Theme:         "tokyoNight",
			CronSchedule:  "0 */12 * * *",
			GitHubAPIKey:  "",
			EncryptionKey: utils.GenerateEncryptionKey(),
			LastScan:      "No scan performed yet",
		})
	}
}
