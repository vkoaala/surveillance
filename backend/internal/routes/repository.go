package routes

import (
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/services"
	"surveillance/internal/utils"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func InitRepositoryRoutes(e *echo.Echo, db *gorm.DB) {
	e.POST("/repositories", func(ctx echo.Context) error {
		githubToken := utils.GetGitHubToken(db)
		return AddRepository(ctx, db, githubToken)
	})
	e.GET("/repositories", func(ctx echo.Context) error {
		var repos []models.Repository
		if err := db.Find(&repos).Error; err != nil {
			return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch repositories"})
		}
		return ctx.JSON(http.StatusOK, repos)
	})
	e.DELETE("/repositories/:id", func(ctx echo.Context) error {
		id := ctx.Param("id")
		if err := db.Delete(&models.Repository{}, id).Error; err != nil {
			return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete repository"})
		}
		return ctx.JSON(http.StatusOK, map[string]string{"message": "Repository deleted"})
	})
	e.POST("/scan-updates", func(ctx echo.Context) error {
		githubToken := utils.GetGitHubToken(db)
		nextScan := time.Now().Add(6 * time.Hour).Format("Jan 02 3:04 PM")
		go services.MonitorRepositories(db, githubToken, nextScan, true)
		return ctx.JSON(http.StatusOK, map[string]string{"message": "Manual scan started"})
	})
}

func AddRepository(ctx echo.Context, db *gorm.DB, githubToken string) error {
	var payload struct {
		Name    string `json:"name"`
		URL     string `json:"url"`
		Version string `json:"version"`
	}
	if err := ctx.Bind(&payload); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}
	repo := models.Repository{Name: payload.Name, URL: payload.URL}
	releaseVersion, releaseDate, changelog := services.GetLatestReleaseInfo(payload.Name, githubToken)
	if releaseVersion == "" {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve latest release"})
	}
	if payload.Version == "" || payload.Version == "latest" {
		repo.CurrentVersion = releaseVersion
	} else {
		repo.CurrentVersion = payload.Version
	}
	repo.LatestRelease = releaseVersion
	repo.LastUpdated = releaseDate
	repo.Changelog = changelog
	if err := db.Create(&repo).Error; err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to add repository"})
	}
	return ctx.JSON(http.StatusCreated, repo)
}
