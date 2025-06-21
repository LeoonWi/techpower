package main

import (
	"github.com/labstack/echo/v4"
	"techwizBackend/pkg/repository"
	"techwizBackend/pkg/service"
	"techwizBackend/pkg/transport/http"
)

func main() {
	// Init Web Server
	e := echo.New()
	// Init connection MongoDB
	db := repository.New()
	// Init repositories
	authRepository := repository.NewAuthRepository(db)
	// Create services
	authService := service.NewAuthService(authRepository)
	// Create general service
	services := service.NewServices(authService)
	// Init handler
	http.New(e, services)
	// Start server
	err := e.Start(":8080")
	if err != nil {
		return
	}
}
