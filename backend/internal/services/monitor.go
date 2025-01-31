package services

import (
	"encoding/json"
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
	utils.Logger.Infof("Latest release for %s: %s (published on %s)", repoName, release.TagName, release.PublishedAt)
	return release.TagName, date.Format("Jan 02 2006"), release.Body
}

func MonitorRepositories(db *gorm.DB, githubToken, nextScanTime string, isManual bool) error {
	utils.Logger.Info("Starting repository scan...")

	var repos []models.Repository
	if err := db.Find(&repos).Error; err != nil {
		utils.Logger.Error("Failed to retrieve repositories: ", err)
		return err
	}
	if len(repos) == 0 {
		utils.Logger.Warn("No repositories found to scan.")
		return nil
	}

	updates := []models.Repository{}
	for _, repo := range repos {
		latestVersion, lastUpdated, changelog := GetLatestReleaseInfo(repo.Name, githubToken)
		if latestVersion != "" && repo.CurrentVersion != latestVersion {
			utils.Logger.Infof("Update found for %s: %s -> %s", repo.Name, repo.CurrentVersion, latestVersion)
			repo.CurrentVersion = latestVersion
			repo.LatestRelease = latestVersion
			repo.LastUpdated = lastUpdated
			repo.Changelog = changelog
			updates = append(updates, repo)
		} else {
			utils.Logger.Infof("%s is up to date.", repo.Name)
		}
	}

	if len(updates) > 0 {
		if err := db.Save(&updates).Error; err != nil {
			utils.Logger.Error("Failed to update repositories: ", err)
			return err
		}
		utils.Logger.Infof("%d repositories updated successfully.", len(updates))
	} else {
		utils.Logger.Info("All repositories are up to date.")
	}

	if isManual {
		utils.Logger.Info("Manual repository scan finished.")
	} else {
		utils.Logger.Info("Scheduled repository scan finished.")
	}
	return nil
}
