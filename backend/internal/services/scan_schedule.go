package services

import (
	"time"

	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

func CalculateNextScan(cronExpression string) (string, error) {
	schedule, err := cron.ParseStandard(cronExpression)
	if err != nil {
		return "Invalid cron expression", err
	}

	nextScan := schedule.Next(time.Now())
	return formatNextScan(nextScan), nil
}

func GetLastAndNextScanTimes(db *gorm.DB) (lastScan, nextScan string) {
	var settings struct {
		LastScan     string
		CronSchedule string
	}

	db.Table("settings").Select("last_scan, cron_schedule").First(&settings)

	lastScan = settings.LastScan
	if lastScan == "" {
		lastScan = "No scan performed yet"
	}

	nextScan, err := CalculateNextScan(settings.CronSchedule)
	if err != nil {
		nextScan = "Error calculating next scan"
	}

	return lastScan, nextScan
}

func UpdateLastScanTime(db *gorm.DB) {
	currentTime := time.Now().Format("Jan 02 2006 3:04 PM")
	db.Exec("UPDATE settings SET last_scan = ?", currentTime)
}

func formatNextScan(nextScan time.Time) string {
	now := time.Now()
	if nextScan.Year() == now.Year() && nextScan.YearDay() == now.YearDay() {
		return "Today - " + nextScan.Format("3:04 PM")
	}

	if nextScan.Year() == now.Year() && nextScan.YearDay() == now.YearDay()+1 {
		return "Tomorrow - " + nextScan.Format("3:04 PM")
	}

	return nextScan.Format("Jan 02 2006 3:04 PM")
}
