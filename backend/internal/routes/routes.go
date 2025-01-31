package routes

import (
	"surveillance/internal/routes/notifications"
	"surveillance/internal/routes/repository"
	"surveillance/internal/routes/scan"
	"surveillance/internal/routes/settings"
	"surveillance/internal/routes/validation"

	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

func RegisterRoutes(e *echo.Echo, db *gorm.DB, scheduler *cron.Cron, jobID *cron.EntryID) {
	repository.RegisterRepositoryRoutes(e, db)
	settings.RegisterSettingsRoutes(e, db, scheduler, jobID)
	notifications.RegisterNotificationRoutes(e, db)
	validation.RegisterValidationRoutes(e)
	scan.RegisterScanRoutes(e, db)
}
