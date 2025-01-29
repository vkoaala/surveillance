package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"surveillance/internal/models"
	"time"

	"gorm.io/gorm"
)

func checkForReleaseUpdate(db *gorm.DB, repo models.Repository) {
	githubAPI := fmt.Sprintf("https://api.github.com/repos/%s/releases/latest", repo.Name)

	resp, err := http.Get(githubAPI)
	if err != nil || resp.StatusCode != http.StatusOK {
		fmt.Printf("Failed to fetch release for %s: %v\n", repo.Name, err)
		return
	}
	defer resp.Body.Close()

	var releaseData struct {
		TagName     string `json:"tag_name"` // Version (e.g., v0.8.12)
		PublishedAt string `json:"published_at"`
		Body        string `json:"body"`     // Changelog in Markdown format
		HTMLURL     string `json:"html_url"` // Link to release page
	}
	if err := json.NewDecoder(resp.Body).Decode(&releaseData); err != nil {
		fmt.Printf("Failed to parse release data for %s: %v\n", repo.Name, err)
		return
	}

	// Format the published date
	parsedDate, _ := time.Parse(time.RFC3339, releaseData.PublishedAt)
	formattedDate := parsedDate.Format("Jan 02 2006")

	// Store the changelog, keeping markdown format
	db.Model(&repo).Updates(models.Repository{
		LatestRelease: releaseData.TagName,
		LastUpdated:   formattedDate,
		Changelog:     releaseData.Body, // Store markdown-formatted body
	})
}

func MonitorRepositories(db *gorm.DB) {
	fmt.Println("Scanning repositories for updates...")

	db.Exec("UPDATE repositories SET last_scan = ?", time.Now().Format("Jan 02 2006 15:04:05"))

	var repos []models.Repository
	if err := db.Find(&repos).Error; err != nil {
		fmt.Printf("Failed to fetch repositories: %v\n", err)
		return
	}

	for _, repo := range repos {
		checkForReleaseUpdate(db, repo)
	}
}
