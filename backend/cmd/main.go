package main

import (
	"surveillance/internal/config/cron"
	"surveillance/internal/config/database"
	"surveillance/internal/routes"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	utils.InitLogger()

	db := database.InitDB()
	scheduler, cronJobID := cron.StartScheduler(db)

	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
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
	e.Logger.Fatal(e.Start(":8080"))
}
