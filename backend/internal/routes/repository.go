package routes

import (
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/services"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func InitRepositoryRoutes(e *echo.Echo, db *gorm.DB) {
	e.POST("/repositories", func(ctx echo.Context) error {
		var payload struct {
			Name    string `json:"name"`
			URL     string `json:"url"`
			Version string `json:"version"`
		}
		if err := ctx.Bind(&payload); err != nil {
			return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		githubToken := utils.GetGitHubToken(db)
		utils.Logger.Infof("Handling request to add a new repository: %s", payload.Name)

		releaseVersion, releaseDate, changelog := services.GetLatestReleaseInfo(payload.Name, githubToken)
		if releaseVersion == "" {
			utils.Logger.Warnf("Failed to fetch GitHub release info for: %s", payload.Name)
			return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve latest release"})
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
			utils.Logger.Error("Error adding repository: ", err)
			return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to add repository"})
		}

		utils.Logger.Infof("Successfully added repository: %s (%s)", repo.Name, repo.URL)
		return ctx.JSON(http.StatusCreated, repo)
	})

	e.GET("/repositories", func(ctx echo.Context) error {
		var repos []models.Repository
		if err := db.Find(&repos).Error; err != nil {
			utils.Logger.Error("Error fetching repositories: ", err)
			return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch repositories"})
		}
		return ctx.JSON(http.StatusOK, repos)
	})

	e.GET("/repositories/:id/changelog", func(ctx echo.Context) error {
		repoID := ctx.Param("id")
		var repo models.Repository

		if err := db.First(&repo, repoID).Error; err != nil {
			utils.Logger.Error("Repository not found: ", err)
			return ctx.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
		}

		return ctx.JSON(http.StatusOK, map[string]string{
			"content": repo.Changelog,
		})
	})

	e.POST("/scan-updates", func(ctx echo.Context) error {
		githubToken := utils.GetGitHubToken(db)
		utils.Logger.Info("Manual repository scan started.")
		if err := services.MonitorRepositories(db, githubToken, "", true); err != nil {
			return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Manual scan failed"})
		}
		return ctx.JSON(http.StatusOK, map[string]string{"message": "Manual scan completed successfully"})
	})

	e.DELETE("/repositories/:id", func(ctx echo.Context) error {
		if err := db.Delete(&models.Repository{}, ctx.Param("id")).Error; err != nil {
			utils.Logger.Error("Error deleting repository: ", err)
			return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete repository"})
		}
		utils.Logger.Info("Repository deleted successfully.")
		return ctx.JSON(http.StatusOK, map[string]string{"message": "Repository deleted"})
	})
}

func ifEmpty(value, fallback string) string {
	if value == "" || value == "latest" {
		return fallback
	}
	return value
}
