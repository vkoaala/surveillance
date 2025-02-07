package routes

import (
	"log"
	"net/http"
	"os"
	"surveillance/internal/routes/auth"
	"surveillance/internal/routes/notifications"
	"surveillance/internal/routes/repository"
	"surveillance/internal/routes/scan"
	"surveillance/internal/routes/settings"
	"surveillance/internal/routes/validation"
	"surveillance/internal/utils"

	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

func RegisterRoutes(e *echo.Echo, db *gorm.DB, scheduler *cron.Cron, jobID *cron.EntryID) {
	auth.RegisterAuthRoutes(e, db)
	auth.RegisterPasswordPolicyRoute(e)
	validation.RegisterValidationRoutes(e)

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is not set in environment variables")
	}

	protected := e.Group("")
	protected.Use(echojwt.WithConfig(echojwt.Config{
		SigningKey: []byte(jwtSecret),
		Skipper: func(c echo.Context) bool {
			if c.Path() == "/settings" && c.Request().Method == http.MethodGet {
				return true
			}
			return false
		},
		ErrorHandler: func(c echo.Context, err error) error {
			utils.Logger.Errorf("JWT Error: %v", err)
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized - JWT validation failed."})
		},
	}))

	repository.RegisterRepositoryRoutes(protected, db)
	settings.RegisterSettingsRoutes(protected, db, scheduler, jobID)
	notifications.RegisterNotificationRoutes(protected, db)
	scan.RegisterScanRoutes(protected, db)
	protected.GET("/api/validate-key", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"message": "GitHub API key is valid"})
	})
}
