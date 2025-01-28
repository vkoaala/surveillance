package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"

	"surveillance/internal/models"
	"surveillance/internal/services"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func InitRepositoryRoutes(e *echo.Echo) {
	e.POST("/repositories", AddRepository)
	e.GET("/repositories", GetRepositories)
	e.DELETE("/repositories/:id", DeleteRepository)
	e.POST("/scan-updates", ScanForUpdates)
	e.GET("/repositories/:id/changelog", GetChangelog)

}

func AddRepository(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	var payload struct {
		Name    string `json:"name"`
		URL     string `json:"url"`
		Version string `json:"version"`
	}

	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid payload"})
	}

	// Extract the repo name from the URL
	repoNameMatch := regexp.MustCompile(`github\.com/([\w-]+/[\w.-]+)`).FindStringSubmatch(payload.URL)
	if repoNameMatch == nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid GitHub URL"})
	}
	repoName := repoNameMatch[1]

	// Fetch the latest release from GitHub
	githubAPI := fmt.Sprintf("https://api.github.com/repos/%s/releases/latest", repoName)
	resp, err := http.Get(githubAPI)
	if err != nil || resp.StatusCode != http.StatusOK {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch repository details"})
	}
	defer resp.Body.Close()

	var releaseData struct {
		TagName     string `json:"tag_name"`
		PublishedAt string `json:"published_at"`
		Body        string `json:"body"` // Release notes
	}
	if err := json.NewDecoder(resp.Body).Decode(&releaseData); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to parse repository details"})
	}

	// Use the specified version or default to the latest release
	currentVersion := payload.Version
	if currentVersion == "" {
		currentVersion = releaseData.TagName
	}

	// Create the repository entry
	repo := models.Repository{
		Name:           payload.Name,
		URL:            payload.URL,
		CurrentVersion: currentVersion,
		LatestRelease:  releaseData.TagName,
		LastUpdated:    releaseData.PublishedAt,
		Changelog:      releaseData.Body, // Store the release notes
	}

	if payload.Name == "" {
		repo.Name = repoName // Use the repo name from GitHub if no name is provided
	}

	if err := db.Create(&repo).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to add repository"})
	}

	return c.JSON(http.StatusCreated, repo)
}

func GetRepositories(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)
	var repos []models.Repository

	if err := db.Find(&repos).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch repositories"})
	}

	return c.JSON(http.StatusOK, repos)
}

func DeleteRepository(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)
	id := c.Param("id")

	if err := db.Delete(&models.Repository{}, id).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete repository"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Repository deleted"})
}

func ScanForUpdates(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)
	go services.MonitorRepositories(db)
	return c.JSON(http.StatusOK, map[string]string{"message": "Scanning started"})
}

func GetChangelog(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)
	id := c.Param("id")

	var repo models.Repository
	if err := db.First(&repo, id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Repository not found"})
	}

	if repo.Changelog == "" {
		return c.JSON(http.StatusOK, map[string]string{"changelog": "No changelog available for this repository."})
	}

	return c.JSON(http.StatusOK, map[string]string{"changelog": repo.Changelog})
}
