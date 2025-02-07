package env

import (
	"fmt"
	"os"
	"surveillance/internal/utils"
	"time"
)

func LoadEnv() {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		fmt.Println("JWT_SECRET environment variable is required.")
		os.Exit(1)
	}

	salt, err := utils.GenerateRandomSalt(16)
	if err != nil {
		utils.Logger.Fatalf("Failed to generate random salt: %v", err)
		os.Exit(1)
	}

	timezone := os.Getenv("TIMEZONE")
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

	utils.SetEncryptionParameters(jwtSecret, salt) // Pass the *generated* salt.
}
