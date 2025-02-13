package main

import (
	"net/http"
	"surveillance/internal/config/cron"
	"surveillance/internal/config/database"
	"surveillance/internal/config/env"
	"surveillance/internal/routes"
	"surveillance/internal/utils"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	env.LoadEnv()

	db := database.InitDB()
	scheduler, cronJobID := cron.StartScheduler(db)
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete, http.MethodPatch},
	}))

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("db", db)
			c.Set("scheduler", scheduler)
			c.Set("cronJobID", &cronJobID)
			return next(c)
		}
	})
	e.GET("/favicon.ico", func(c echo.Context) error {
		return c.NoContent(http.StatusNoContent)
	})
	routes.RegisterRoutes(e, db, scheduler, &cronJobID)
	e.Static("/", "./frontend")

	utils.Logger.Fatal(e.Start(":8080"))
}
