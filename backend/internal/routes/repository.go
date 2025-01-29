package routes

import (
	"log"
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/services"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func InitRepositoryRoutes(e *echo.Echo, db *gorm.DB) {
	e.POST("/repositories", func(ctx echo.Context) error { return AddRepository(ctx, db) })
	e.GET("/repositories", func(ctx echo.Context) error { return GetRepositories(ctx, db) })
	e.DELETE("/repositories/:id", func(ctx echo.Context) error { return DeleteRepository(ctx, db) })
	e.POST("/scan-updates", func(ctx echo.Context) error { return ScanForUpdates(ctx, db) })
	e.GET("/repositories/:id/changelog", func(ctx echo.Context) error { return GetChangelog(ctx, db) })
}

func AddRepository(ctx echo.Context, db *gorm.DB) error {
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
		Name:           payload.Name,
		URL:            payload.URL,
		CurrentVersion: payload.Version,
	}

	if err := db.Create(&repo).Error; err != nil {
		log.Println("❌ Failed to add repository")
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to add repository"})
	}

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

func ScanForUpdates(ctx echo.Context, db *gorm.DB) error {
	go services.MonitorRepositories(db) // Run in background
	return ctx.JSON(http.StatusOK, map[string]string{"message": "Scanning started"})
}

func GetChangelog(ctx echo.Context, db *gorm.DB) error {
	id := ctx.Param("id")
	var repo models.Repository
	if err := db.First(&repo, id).Error; err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
	}
	return ctx.JSON(http.StatusOK, map[string]string{"changelog": repo.Changelog})
}
