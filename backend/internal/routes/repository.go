package routes

import (
	"log"
	"net/http"

	"surveillance/internal/models"
	"surveillance/internal/services"

	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

var cronSchedule = "@every 6h" // Default cron schedule

func InitRepositoryRoutes(e *echo.Echo, db *gorm.DB, c *cron.Cron) {
	e.POST("/repositories", func(ctx echo.Context) error { return AddRepository(ctx, db) })
	e.GET("/repositories", func(ctx echo.Context) error { return GetRepositories(ctx, db) })
	e.DELETE("/repositories/:id", func(ctx echo.Context) error { return DeleteRepository(ctx, db) })
	e.POST("/scan-updates", func(ctx echo.Context) error { return ScanForUpdates(ctx, db) })
	e.GET("/repositories/:id/changelog", func(ctx echo.Context) error { return GetChangelog(ctx, db) })
	e.POST("/update-cron", func(ctx echo.Context) error { return UpdateCronSchedule(ctx, db, c) })
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

func UpdateCronSchedule(ctx echo.Context, db *gorm.DB, c *cron.Cron) error {
	var payload struct {
		Cron string `json:"cron"`
	}

	if err := ctx.Bind(&payload); err != nil {
		log.Println("❌ Invalid cron update request received")
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	// Set the new cron schedule
	cronSchedule = payload.Cron

	// Start a new cron job with the updated schedule
	startCronJob(db, c)

	log.Printf("🔄 Cron job updated successfully. New schedule: %s", cronSchedule)

	return ctx.JSON(http.StatusOK, map[string]string{"message": "Cron schedule updated successfully!"})
}

func startCronJob(db *gorm.DB, c *cron.Cron) {
	c.Stop() // Stop any existing cron job (no log output)

	entryID, err := c.AddFunc(cronSchedule, func() { services.MonitorRepositories(db) })
	if err != nil {
		log.Printf("❌ Failed to set new cron schedule: %s | Error: %v", cronSchedule, err)
		return
	}
	c.Start()

	// Get next run time
	nextRun := "N/A"
	entries := c.Entries()
	for _, entry := range entries {
		if entry.ID == entryID {
			nextRun = entry.Next.Format("Jan 02 2006 15:04:05")
			break
		}
	}

	log.Printf("🔄 Cron schedule updated: Running every %s...\n⏭️ Next run: %s", cronSchedule, nextRun)
}
