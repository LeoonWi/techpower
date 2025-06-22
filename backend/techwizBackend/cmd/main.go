package main

import (
	"context"
	"github.com/labstack/echo/v4"
	"log"
	"techwizBackend/pkg/repository"
	"techwizBackend/pkg/service"
	"techwizBackend/pkg/transport/http"
)

func main() {
	// Init Web Server
	e := echo.New()
	// Init connection MongoDB
	db := repository.New()
	defer func() {
		if err := db.Disconnect(context.TODO()); err != nil {
			log.Println(err)
			panic(err)
		}
	}()
	// Init repositories
	authRepository := repository.NewAuthRepository(db)
	userRepository := repository.NewUserRepository(db)
	// Create services
	authService := service.NewAuthService(authRepository, userRepository)
	userService := service.NewUserService(userRepository)
	// Create general service
	services := service.NewServices(authService, userService)
	// Init handler
	http.New(e, services)
	// Start server
	err := e.Start(":8080")
	if err != nil {
		return
	}
}
