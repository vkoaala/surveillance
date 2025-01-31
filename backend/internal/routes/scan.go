package routes

import (
	"net/http"
	"surveillance/internal/services"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func InitScanRoutes(e *echo.Echo, db *gorm.DB) {
	e.POST("/scan-updates", func(c echo.Context) error {
		githubToken := utils.GetGitHubToken(db)
		err := services.MonitorRepositories(db, githubToken, "Manual Trigger", true)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Scan failed"})
		}
		return c.JSON(http.StatusOK, map[string]string{"message": "Scan completed"})
	})
}
