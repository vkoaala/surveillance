package scan

import (
	"net/http"
	"surveillance/internal/services"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterScanRoutes(r *echo.Group, db *gorm.DB) {
	r.POST("/scan-updates", func(c echo.Context) error {
		githubToken := utils.GetGitHubToken(db)
		if err := services.MonitorRepositories(db, githubToken, "Manual", true); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Scan failed"})
		}
		services.UpdateLastScanTime(db)
		return c.JSON(http.StatusOK, map[string]string{"message": "Scan completed"})
	})
	r.GET("/scan-status", func(c echo.Context) error {
		lastScan, nextScan := services.GetLastAndNextScanTimes(db)
		return c.JSON(http.StatusOK, map[string]string{
			"lastScan": lastScan,
			"nextScan": nextScan,
		})
	})
}
