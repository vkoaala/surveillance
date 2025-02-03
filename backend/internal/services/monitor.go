package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"surveillance/internal/models"
	"surveillance/internal/utils"
	"time"

	"gorm.io/gorm"
)

type GitHubRelease struct {
	TagName     string `json:"tag_name"`
	PublishedAt string `json:"published_at"`
	Body        string `json:"body"`
}

func GetLatestReleaseInfo(repoName, githubToken string) (string, string, string) {
	req, _ := http.NewRequest("GET", "https://api.github.com/repos/"+repoName+"/releases/latest", nil)
	if githubToken != "" {
		req.Header.Set("Authorization", "Bearer "+githubToken)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		utils.Logger.Warnf("Failed to fetch release info for %s: %v", repoName, err)
		return "", "", ""
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		utils.Logger.Warnf("GitHub API request for %s failed with status: %s", repoName, resp.Status)
		return "", "", ""
	}
	var release GitHubRelease
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		utils.Logger.Warnf("Failed to decode response for %s: %v", repoName, err)
		return "", "", ""
	}
	date, _ := time.Parse(time.RFC3339, release.PublishedAt)
	return release.TagName, date.Format("Jan 02 2006"), release.Body
}

func MonitorRepositories(db *gorm.DB, githubToken, scanType string, isManual bool) error {
	var repos []models.Repository
	if err := db.Find(&repos).Error; err != nil {
		utils.Logger.Error("❌ Failed to retrieve repositories: ", err)
		return err
	}
	emoji := "🔵"
	if !isManual {
		emoji = "🟢"
	}
	utils.Logger.Infof("%s %s scan started for %d repositories", emoji, scanType, len(repos))
	updates := []string{}
	for _, repo := range repos {
		latestVersion, lastUpdated, changelog := GetLatestReleaseInfo(repo.Name, githubToken)
		if latestVersion != "" && repo.LatestRelease != latestVersion {
			updates = append(updates, fmt.Sprintf("%s: %s -> %s", repo.Name, repo.LatestRelease, latestVersion))
			repo.LatestRelease = latestVersion
			repo.CurrentVersion = latestVersion
			repo.LastUpdated = lastUpdated
			repo.Changelog = changelog
		}
	}
	if len(updates) > 0 {
		if err := db.Save(&repos).Error; err != nil {
			utils.Logger.Error("❌ Failed to update repositories: ", err)
			return err
		}
		utils.Logger.Infof("🔄 Updated repositories:\n%s", formatUpdates(updates))
	} else {
		utils.Logger.Info("✅ All repositories are up to date.")
	}
	UpdateLastScanTime(db)
	utils.Logger.Infof("%s %s scan completed successfully", emoji, scanType)
	return nil
}

func formatUpdates(updates []string) string {
	return fmt.Sprintf("   %s", stringJoin(updates, "\n   "))
}

func stringJoin(items []string, sep string) string {
	result := ""
	for i, item := range items {
		result += item
		if i < len(items)-1 {
			result += sep
		}
	}
	return result
}
