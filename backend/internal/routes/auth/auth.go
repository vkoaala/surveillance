package auth

import (
	"net/http"
	"strings"
	"time"
	"unicode"

	"surveillance/internal/models"
	"surveillance/internal/utils"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var jwtSecret = []byte("mysecretkey")
var passwordPolicyRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{12,}$"
var passwordPolicyDescription = "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."

func RegisterPasswordPolicyRoute(e *echo.Echo) {
	e.GET("/api/password-policy", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"pattern":     passwordPolicyRegex,
			"description": passwordPolicyDescription,
		})
	})
}

func generateJWT(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func sendErrorResponse(c echo.Context, status int, message string) error {
	return c.JSON(status, map[string]string{"error": message})
}

func checkPasswordStrength(password string) bool {
	if len(password) < 12 {
		return false
	}
	var hasLower, hasUpper, hasDigit, hasSpecial bool
	for _, r := range password {
		switch {
		case unicode.IsLower(r):
			hasLower = true
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsDigit(r):
			hasDigit = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSpecial = true
		}
	}
	return hasLower && hasUpper && hasDigit && hasSpecial
}

func RegisterAuthRoutes(e *echo.Echo, db *gorm.DB) {
	e.POST("/auth/register", func(c echo.Context) error {
		var input struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := c.Bind(&input); err != nil {
			return sendErrorResponse(c, http.StatusBadRequest, "Invalid request payload")
		}
		if strings.TrimSpace(input.Username) == "" || strings.TrimSpace(input.Password) == "" {
			return sendErrorResponse(c, http.StatusBadRequest, "Username and password cannot be empty.")
		}
		if !checkPasswordStrength(input.Password) {
			return sendErrorResponse(c, http.StatusBadRequest, "Password does not meet the strength requirements.")
		}
		var count int64
		db.Model(&models.User{}).Where("username = ?", input.Username).Count(&count)
		if count > 0 {
			return sendErrorResponse(c, http.StatusConflict, "User already exists.")
		}
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		user := models.User{Username: input.Username, Password: string(hashedPassword)}
		db.Create(&user)
		return c.JSON(http.StatusCreated, map[string]string{"message": "User registered successfully"})
	})

	e.POST("/auth/login", func(c echo.Context) error {
		var input struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := c.Bind(&input); err != nil {
			return sendErrorResponse(c, http.StatusBadRequest, "Invalid request payload")
		}
		input.Username = strings.TrimSpace(input.Username)
		input.Password = strings.TrimSpace(input.Password)
		if input.Username == "" || input.Password == "" {
			return sendErrorResponse(c, http.StatusBadRequest, "Username and password are required.")
		}
		var user models.User
		if err := db.Where("username = ?", input.Username).First(&user).Error; err != nil {
			utils.Logger.Warn("Login failed for non-existing user:", input.Username)
			return sendErrorResponse(c, http.StatusUnauthorized, "Invalid username or password.")
		}
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
			utils.Logger.Warnf("Password mismatch for user: %s", input.Username)
			return sendErrorResponse(c, http.StatusUnauthorized, "Invalid username or password.")
		}
		token, err := generateJWT(user)
		if err != nil {
			utils.Logger.Error("Failed to generate JWT:", err)
			return sendErrorResponse(c, http.StatusInternalServerError, "Internal server error.")
		}
		return c.JSON(http.StatusOK, map[string]string{"token": token, "message": "Login successful."})
	})

	e.GET("/auth/exists", func(c echo.Context) error {
		var count int64
		db.Model(&models.User{}).Count(&count)
		return c.JSON(http.StatusOK, map[string]bool{"exists": count > 0})
	})
}
