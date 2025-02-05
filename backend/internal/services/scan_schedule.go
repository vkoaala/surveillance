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
	if settings.LastScan == "" {
		lastScan = "No scan performed yet"
	} else {
		lastScan = formatLastScan(settings.LastScan)
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
		return "Today at " + nextScan.Format("3:04 PM")
	}
	if nextScan.Year() == now.Year() && nextScan.YearDay() == now.YearDay()+1 {
		return "Tomorrow at " + nextScan.Format("3:04 PM")
	}
	return nextScan.Format("Jan 02 at 3:04 PM")
}

func formatLastScan(lastScanStr string) string {
	const layout = "Jan 02 2006 3:04 PM"
	if lastScanStr == "" || lastScanStr == "No scan performed yet" {
		return "No scan performed yet"
	}
	lastScan, err := time.Parse(layout, lastScanStr)
	if err != nil {
		return lastScanStr
	}
	now := time.Now()
	if lastScan.Year() == now.Year() && lastScan.YearDay() == now.YearDay() {
		return "Today at " + lastScan.Format("3:04 PM")
	}
	if lastScan.Year() == now.Year() && lastScan.YearDay() == now.YearDay()-1 {
		return "Yesterday at " + lastScan.Format("3:04 PM")
	}
	return lastScan.Format("Jan 02 at 3:04 PM")
}
