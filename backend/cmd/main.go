package main

import (
	"log"
	"surveillance/internal/config/cron"
	"surveillance/internal/config/database"
	"surveillance/internal/config/env"
	"surveillance/internal/routes"
	"surveillance/internal/utils"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file:", err)
	}

	env.LoadEnv()

	db := database.InitDB()
	scheduler, cronJobID := cron.StartScheduler(db)
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
		AllowCredentials: true,
	}))
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("db", db)
			c.Set("scheduler", scheduler)
			c.Set("cronJobID", &cronJobID)
			return next(c)
		}
	})
	routes.RegisterRoutes(e, db, scheduler, &cronJobID)

	utils.Logger.Fatal(e.Start(":8080"))
}
