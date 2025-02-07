package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"surveillance/internal/models"
	"surveillance/internal/utils"

	"gorm.io/gorm"
)

type GitHubRelease struct {
	TagName     string `json:"tag_name"`
	PublishedAt string `json:"published_at"`
	Body        string `json:"body"`
}

func GetLatestReleaseInfo(repoName, githubToken string) (string, string, string) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest("GET", "https://api.github.com/repos/"+repoName+"/releases/latest", nil)
	if err != nil {
		utils.Logger.Warnf("Failed to create request for %s: %v", repoName, err)
		return "", "", ""
	}
	if githubToken != "" {
		req.Header.Set("Authorization", "Bearer "+githubToken)
	}

	resp, err := client.Do(req)
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

	var updates strings.Builder
	var notifications []string

	for i := range repos {
		latestVersion, lastUpdated, changelog := GetLatestReleaseInfo(repos[i].Name, githubToken)
		if latestVersion == "" {
			continue
		}

		previousLatestRelease := repos[i].LatestRelease

		if repos[i].LatestRelease != latestVersion {
			if repos[i].NotifiedVersion != latestVersion {
				updates.WriteString(fmt.Sprintf("- [%s](%s): %s → %s\n", repos[i].Name, repos[i].URL, previousLatestRelease, latestVersion))
				notifications = append(notifications, fmt.Sprintf("- [%s](%s): %s → %s", repos[i].Name, repos[i].URL, previousLatestRelease, latestVersion))
				repos[i].NotifiedVersion = latestVersion
			}

			repos[i].LatestRelease = latestVersion
			repos[i].LastUpdated = lastUpdated
			repos[i].Changelog = changelog

			if err := db.Save(&repos[i]).Error; err != nil {
				utils.Logger.Error("❌ Failed to update repository: ", err)
				return err
			}
		}
	}

	if updates.Len() > 0 {
		formattedMsg := formatUpdates(notifications)
		utils.Logger.Infof("🔄 Updated repositories:\n%s", formattedMsg)
		if err := SendDiscordNotification(db, formattedMsg, scanType); err != nil {
			utils.Logger.Errorf("Failed to send Discord notification: %v", err)
		}
	} else {
		utils.Logger.Info("✅ All repositories are up to date.")
	}

	UpdateLastScanTime(db)
	utils.Logger.Infof("%s %s scan completed successfully", emoji, scanType)
	return nil
}

func formatUpdates(updates []string) string {
	return stringJoin(updates, "\n")
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
