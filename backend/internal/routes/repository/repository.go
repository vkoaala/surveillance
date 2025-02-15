package repository

import (
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/services"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterRepositoryRoutes(e *echo.Group, db *gorm.DB) {
	e.POST("/repositories", func(c echo.Context) error {
		var payload struct {
			Name    string `json:"name"`
			URL     string `json:"url"`
			Version string `json:"version"`
		}
		if err := c.Bind(&payload); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}
		githubToken := utils.GetGitHubToken(db)
		utils.Logger.Infof("🟣 Initial scan started for %s", payload.Name)
		releaseVersion, releaseDate, changelog := services.GetLatestReleaseInfo(payload.Name, githubToken)
		if releaseVersion == "" {
			utils.Logger.Warnf("Failed to fetch GitHub release info for: %s", payload.Name)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve latest release"})
		}
		repo := models.Repository{
			Name:            payload.Name,
			URL:             payload.URL,
			CurrentVersion:  ifEmpty(payload.Version, releaseVersion),
			LatestRelease:   releaseVersion,
			LastUpdated:     releaseDate,
			Changelog:       changelog,
			NotifiedVersion: releaseVersion,
		}
		if err := db.Create(&repo).Error; err != nil {
			utils.Logger.Error("Error adding repository: ", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to add repository"})
		}

		utils.Logger.Infof("Latest release for %s: %s - %s", payload.Name, releaseVersion, releaseDate)
		utils.Logger.Infof("🟣 Initial scan finished")
		return c.JSON(http.StatusCreated, repo)
	})

	e.POST("/repositories/:id/mark-updated", func(c echo.Context) error {
		id := c.Param("id")
		var repo models.Repository
		if err := db.First(&repo, id).Error; err != nil {
			utils.Logger.Error("Repository not found: ", err)
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
		}

		repo.CurrentVersion = repo.LatestRelease
		repo.NotifiedVersion = repo.LatestRelease

		if err := db.Save(&repo).Error; err != nil {
			utils.Logger.Error("Failed to mark repository as updated: ", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to mark repository as updated"})
		}
		if err := db.First(&repo, id).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve updated repository"})
		}

		return c.JSON(http.StatusOK, repo)
	})

	e.GET("/repositories", func(c echo.Context) error {
		var repos []models.Repository
		if err := db.Find(&repos).Error; err != nil {
			utils.Logger.Error("Error fetching repositories: ", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch repositories"})
		}
		return c.JSON(http.StatusOK, repos)
	})

	e.GET("/repositories/:id/changelog", func(c echo.Context) error {
		repoID := c.Param("id")
		var repo models.Repository
		if err := db.First(&repo, repoID).Error; err != nil {
			utils.Logger.Error("Repository not found: ", err)
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
		}
		return c.JSON(http.StatusOK, map[string]string{"content": repo.Changelog})
	})

	e.PATCH("/repositories/:id", func(c echo.Context) error {
		repoID := c.Param("id")
		var repo models.Repository
		if err := db.First(&repo, repoID).Error; err != nil {
			utils.Logger.Error("Repository not found: ", err)
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
		}
		var payload struct {
			CurrentVersion string `json:"currentVersion"`
		}
		if err := c.Bind(&payload); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
		}

		if payload.CurrentVersion == "" || payload.CurrentVersion == "latest" {
			repo.CurrentVersion = repo.LatestRelease
		} else {
			repo.CurrentVersion = payload.CurrentVersion
		}
		if err := db.Save(&repo).Error; err != nil {
			utils.Logger.Error("Error updating repository: ", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update repository"})
		}
		if err := db.First(&repo, repoID).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve updated repository"})
		}
		return c.JSON(http.StatusOK, repo)
	})

	e.DELETE("/repositories/:id", func(c echo.Context) error {
		repoID := c.Param("id")
		var repo models.Repository
		if err := db.First(&repo, repoID).Error; err != nil {
			utils.Logger.Error("Repository not found: ", err)
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
		}
		if err := db.Delete(&repo).Error; err != nil {
			utils.Logger.Error("Error deleting repository: ", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete repository"})
		}
		utils.Logger.Infof("🗑️ Repository %s deleted", repo.Name)
		return c.JSON(http.StatusOK, map[string]string{"message": "Repository deleted"})
	})
}

func ifEmpty(value, fallback string) string {
	if value == "" || value == "latest" {
		return fallback
	}
	return value
}
