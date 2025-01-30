package routes

import (
	"fmt"
	"log"
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
		githubToken := utils.GetGitHubToken(db) // Updated reference
		return AddRepository(ctx, db, githubToken)
	})
	e.GET("/repositories", func(ctx echo.Context) error { return GetRepositories(ctx, db) })
	e.DELETE("/repositories/:id", func(ctx echo.Context) error { return DeleteRepository(ctx, db) })
	e.POST("/scan-updates", func(ctx echo.Context) error {
		githubToken := utils.GetGitHubToken(db) // Updated reference
		nextScan := time.Now().Add(6 * time.Hour).Format("Jan 02 3:04 PM")
		go services.MonitorRepositories(db, githubToken, nextScan, true) // Manual scan
		return ctx.JSON(http.StatusOK, map[string]string{"message": "Manual scan started"})
	})
	e.GET("/repositories/:id/changelog", func(ctx echo.Context) error { return GetChangelog(ctx, db) })
}

func getGitHubToken(db *gorm.DB) string {
	var settings models.Settings
	if err := db.First(&settings).Error; err == nil && settings.GitHubAPIKey != "" {
		token, err := utils.DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
		if err == nil {
			return token
		}
	}
	return ""
}

func AddRepository(ctx echo.Context, db *gorm.DB, githubToken string) error {
	var payload struct {
		Name    string `json:"name"`
		URL     string `json:"url"`
		Version string `json:"version"`
	}

	if err := ctx.Bind(&payload); err != nil {
		log.Println("❌ Invalid repository request")
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	repo := models.Repository{
		Name: payload.Name,
		URL:  payload.URL,
	}

	scanType := "🔒"
	if githubToken == "" {
		scanType = "🚀"
	}
	fmt.Printf("%s Starting initial scan for %s\n", scanType, payload.Name)
	fmt.Println("===================================")

	releaseVersion, releaseDate, changelog := services.GetLatestReleaseInfo(payload.Name, githubToken)
	if releaseVersion == "" {
		log.Println("❌ Could not retrieve latest release for repository")
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
		log.Println("❌ Failed to add repository")
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to add repository"})
	}

	fmt.Printf("%s: latest version set to %s\n", payload.Name, releaseVersion)
	fmt.Println("===================================")
	fmt.Println("✅ Initial scan completed")
	fmt.Println("-----------------------------------")
	return ctx.JSON(http.StatusCreated, repo)
}

func GetRepositories(ctx echo.Context, db *gorm.DB) error {
	var repos []models.Repository
	if err := db.Find(&repos).Error; err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch repositories"})
	}
	return ctx.JSON(http.StatusOK, repos)
}

func DeleteRepository(ctx echo.Context, db *gorm.DB) error {
	id := ctx.Param("id")
	if err := db.Delete(&models.Repository{}, id).Error; err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete repository"})
	}
	return ctx.JSON(http.StatusOK, map[string]string{"message": "Repository deleted"})
}

func GetChangelog(ctx echo.Context, db *gorm.DB) error {
	id := ctx.Param("id")
	var repo models.Repository
	if err := db.First(&repo, id).Error; err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
	}
	return ctx.JSON(http.StatusOK, map[string]string{"changelog": repo.Changelog})
}
