package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"surveillance/internal/models"
	"time"

	"gorm.io/gorm"
)

type GitHubRelease struct {
	TagName     string `json:"tag_name"`
	PublishedAt string `json:"published_at"`
	Body        string `json:"body"`
}

func GetLatestReleaseInfo(repoName, githubToken string) (string, string, string) {
	api := fmt.Sprintf("https://api.github.com/repos/%s/releases/latest", repoName)
	req, _ := http.NewRequest("GET", api, nil)
	if githubToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", githubToken))
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		fmt.Printf("⚠️  Failed to fetch release for %s\n", repoName)
		return "", "", ""
	}
	defer resp.Body.Close()

	var release GitHubRelease
	json.NewDecoder(resp.Body).Decode(&release)

	parsedDate, _ := time.Parse(time.RFC3339, release.PublishedAt)
	return release.TagName, parsedDate.Format("Jan 02 2006"), release.Body
}

func MonitorRepositories(db *gorm.DB, githubToken, nextScanTime string, isManualScan bool) {
	var repos []models.Repository
	if err := db.Find(&repos).Error; err != nil {
		fmt.Println("⚠️  Failed to fetch repositories")
		return
	}

	if len(repos) == 0 {
		fmt.Println("⚠️  No repositories to scan.")
		return
	}

	scanType := "manual"
	if !isManualScan {
		scanType = "scheduled"
	}

	scanIcon := "🚀"
	if githubToken != "" {
		scanIcon = "🔒"
	}
	fmt.Printf("%s Starting %s scan for %d repositories\n", scanIcon, scanType, len(repos))
	fmt.Println("===================================")

	updatedRepos := []string{}

	for _, repo := range repos {
		latestVersion, lastUpdated, changelog := GetLatestReleaseInfo(repo.Name, githubToken)
		if latestVersion == "" {
			continue
		}
		if repo.CurrentVersion != latestVersion {
			db.Model(&repo).Updates(models.Repository{
				CurrentVersion: latestVersion,
				LatestRelease:  latestVersion,
				LastUpdated:    lastUpdated,
				Changelog:      changelog,
			})
			updatedRepos = append(updatedRepos, fmt.Sprintf("%s: Updated to %s", repo.Name, latestVersion))
		}
	}

	if len(updatedRepos) > 0 {
		for _, msg := range updatedRepos {
			fmt.Println(msg)
		}
	} else {
		fmt.Println("✅ All repositories are up to date")
	}

	fmt.Println("===================================")
	fmt.Println("✅ Scan completed")
	if !isManualScan {
		fmt.Printf("\nNext scan: %s\n", nextScanTime)
	}
	fmt.Println("-----------------------------------")
}
