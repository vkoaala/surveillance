package repository

import (
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/services"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterRepositoryRoutes(r *echo.Group, db *gorm.DB) {
	r.POST("/repositories", func(c echo.Context) error {
		var payload struct {
			Name    string `json:"name"`
			URL     string `json:"url"`
			Version string `json:"version"`
		}
		if err := c.Bind(&payload); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}
		githubToken := utils.GetGitHubToken(db)
		releaseVersion, releaseDate, changelog := services.GetLatestReleaseInfo(payload.Name, githubToken)
		if releaseVersion == "" {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve latest release"})
		}
		repo := models.Repository{
			Name:           payload.Name,
			URL:            payload.URL,
			CurrentVersion: ifEmpty(payload.Version, releaseVersion),
			LatestRelease:  releaseVersion,
			LastUpdated:    releaseDate,
			Changelog:      changelog,
		}
		if err := db.Create(&repo).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to add repository"})
		}
		return c.JSON(http.StatusCreated, repo)
	})
	r.GET("/repositories", func(c echo.Context) error {
		var repos []models.Repository
		if err := db.Find(&repos).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch repositories"})
		}
		return c.JSON(http.StatusOK, repos)
	})
	r.GET("/repositories/:id/changelog", func(c echo.Context) error {
		repoID := c.Param("id")
		var repo models.Repository
		if err := db.First(&repo, repoID).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
		}
		return c.JSON(http.StatusOK, map[string]string{"content": repo.Changelog})
	})
	r.DELETE("/repositories/:id", func(c echo.Context) error {
		repoID := c.Param("id")
		var repo models.Repository
		if err := db.First(&repo, repoID).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
		}
		if err := db.Delete(&repo).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete repository"})
		}
		return c.JSON(http.StatusOK, map[string]string{"message": "Repository deleted"})
	})
}

func ifEmpty(value, fallback string) string {
	if value == "" || value == "latest" {
		return fallback
	}
	return value
}
