package utils

import (
	"fmt"
	"net/http"
	"surveillance/internal/models"

	"gorm.io/gorm"
)

var isAPILogged = false

func GetGitHubToken(db *gorm.DB) string {
	var settings models.Settings
	if err := db.First(&settings).Error; err == nil {
		if settings.GitHubAPIKey == "" {
			return ""
		}

		token, err := DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
		if err == nil {
			return token
		}
		Logger.Warn("Failed to decrypt GitHub token.")
	}
	return ""
}

func ValidateGitHubAPIKey(apiKey string) error {
	if apiKey == "" {
		Logger.Info("No GitHub API key set. Proceeding with unauthenticated GitHub API requests.")
		return nil
	}

	client := &http.Client{}
	req, _ := http.NewRequest("GET", "https://api.github.com/user", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	resp, err := client.Do(req)
	if err != nil {
		Logger.Error("GitHub API request failed: ", err)
		return fmt.Errorf("GitHub API request failed")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		Logger.Error("GitHub API key validation failed with status: ", http.StatusText(resp.StatusCode))
		return fmt.Errorf("GitHub API key validation failed")
	}

	Logger.Info("GitHub API key successfully validated.")
	return nil
}
