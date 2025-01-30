package routes

import (
	"net/http"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
)

// InitValidationRoutes initializes the route for GitHub API key validation.
func InitValidationRoutes(e *echo.Echo) {
	e.POST("/api/validate-key", func(c echo.Context) error {
		var payload struct {
			ApiKey string `json:"apiKey"`
		}

		if err := c.Bind(&payload); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		// Validate the API key using the utility function
		if err := utils.ValidateGitHubAPIKey(payload.ApiKey); err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": err.Error()})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "GitHub API key is valid"})
	})
}
