package env

import (
	"fmt"
	"os"
	"time"

	"surveillance/internal/utils"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	godotenv.Load()

	jwtSecret := os.Getenv("JWT_SECRET")
	salt := os.Getenv("ENCRYPTION_KEY_SALT")
	timezone := os.Getenv("TIMEZONE")

	if jwtSecret == "" {
		fmt.Println("JWT_SECRET environment variable is required.")
		os.Exit(1)
	}

	if salt == "" {
		newSalt, err := utils.GenerateRandomSalt(16)
		if err != nil {
			utils.Logger.Fatal("Failed to generate salt: ", err)
		}
		salt = newSalt
		envContent := fmt.Sprintf("JWT_SECRET=%s\nENCRYPTION_KEY_SALT=%s\n", jwtSecret, salt)
		if err := os.WriteFile(".env", []byte(envContent), 0644); err != nil {
			utils.Logger.Fatal("Failed to write .env file: ", err)
		}
		utils.Logger.Warn("ENCRYPTION_KEY_SALT was not set. A new one has been generated and added to .env")
	}

	if timezone == "" {
		timezone = "UTC"
		utils.Logger.Info("TIMEZONE environment variable not set. Defaulting to UTC.")
	}

	loc, err := time.LoadLocation(timezone)
	if err != nil {
		utils.Logger.Fatalf("Invalid TIMEZONE environment variable (%s): %v", timezone, err)
		os.Exit(1)
	}

	time.Local = loc

	os.Setenv("ENCRYPTION_KEY_SALT", salt)
	os.Setenv("TIMEZONE", timezone)
	utils.SetEncryptionParameters(jwtSecret, salt)
}
