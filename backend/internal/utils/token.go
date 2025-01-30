package utils

import (
	"fmt"
	"net/http"
	"surveillance/internal/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func InitValidationRoutes(e *echo.Echo) {
	e.POST("/api/validate-key", func(c echo.Context) error {
		var payload struct {
			ApiKey string `json:"apiKey"`
		}
		if err := c.Bind(&payload); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		if payload.ApiKey == "" {
			return c.JSON(http.StatusOK, map[string]string{"message": "GitHub API key is empty but valid."})
		}

		if err := ValidateGitHubAPIKey(payload.ApiKey); err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": err.Error()})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "GitHub API key is valid"})
	})
}

func GetGitHubToken(db *gorm.DB) string {
	var settings models.Settings
	if err := db.First(&settings).Error; err == nil && settings.GitHubAPIKey != "" {
		token, err := DecryptAES(settings.GitHubAPIKey, settings.EncryptionKey)
		if err == nil {
			return token
		}
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
		return fmt.Errorf("GitHub API request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GitHub API key validation failed: %s", http.StatusText(resp.StatusCode))
	}

	return nil
}
