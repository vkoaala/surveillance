package routes

import (
	"net/http"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
)

func InitValidationRoutes(e *echo.Echo) {
	e.POST("/api/validate-key", func(c echo.Context) error {
		var input struct {
			ApiKey string `json:"apiKey"`
		}

		if err := c.Bind(&input); err != nil {
			utils.Logger.Error("Invalid payload for API key validation.")
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		if err := utils.ValidateGitHubAPIKey(input.ApiKey); err != nil {
			utils.Logger.Error(err)
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": err.Error()})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "GitHub API key is valid"})
	})
}
