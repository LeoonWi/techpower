package main

import (
	"context"
	"github.com/labstack/echo/v4"
	"log"
	"techwizBackend/pkg/repository/mongodb"
	"techwizBackend/pkg/repository/wsRepository"
	"techwizBackend/pkg/service"
	"techwizBackend/pkg/transport/http"
	"techwizBackend/pkg/transport/ws"
)

func main() {
	// Init Web Server
	e := echo.New()
	// Init connection MongoDB
	db := mongodb.New()
	defer func() {
		if err := db.Disconnect(context.TODO()); err != nil {
			log.Println(err)
			panic(err)
		}
	}()
	// Init repositories
	authRepository := mongodb.NewAuthRepository(db)
	userRepository := mongodb.NewUserRepository(db)
	hubRepository := wsRepository.New()
	go hubRepository.Run()
	// Create services
	authService := service.NewAuthService(authRepository, userRepository)
	userService := service.NewUserService(userRepository)
	// Create general service
	services := service.NewServices(authService, userService)
	// Init handler
	websocket := ws.New(hubRepository)
	http.New(e, services, websocket)
	// Start server
	err := e.Start(":8080")
	if err != nil {
		return
	}
}
