package utils

import (
	"fmt"
	"net/http"
	"surveillance/internal/models"

	"gorm.io/gorm"
)

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
		return nil
	}

	client := &http.Client{}
	req, _ := http.NewRequest("GET", "https://api.github.com/user", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("GitHub API request failed")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GitHub API key validation failed")
	}

	return nil
}
