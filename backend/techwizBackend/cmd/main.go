package main

import (
	"context"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"log"
	"techwizBackend/pkg/repository"
	"techwizBackend/pkg/service"
	"techwizBackend/pkg/transport/http"
	"techwizBackend/pkg/transport/ws"
)

func main() {
	// Init Web Server
	e := echo.New()
	e.Use(middleware.CORS())
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
	chatRepository := repository.NewChatRepository(db)
	categoryRepository := repository.NewCategoryRepository(db)
	userRepository := repository.NewUserRepository(db)
	messageRepository := repository.NewMessageRepository(db)
	requestRepository := repository.NewRequestRepository(db)
	statisticRepository := repository.NewStatisticRepository(db)
	// Create services
	authService := service.NewAuthService(authRepository, userRepository)
	chatService := service.NewChatService(chatRepository, userRepository)
	categoryService := service.NewCategoryService(categoryRepository, chatRepository)
	userService := service.NewUserService(userRepository, chatRepository, requestRepository)
	requestService := service.NewRequestService(requestRepository, userRepository)
	messageService := service.NewMessageService(messageRepository, chatRepository, userRepository)
	statisticService := service.NewStatisticService(statisticRepository)
	// Create general service
	services := service.NewServices(
		authService,
		userService,
		requestService,
		categoryService,
		chatService,
		messageService,
		statisticService,
	)
	// Init hub websocket
	hub := ws.NewHub(services)
	go hub.Run()
	// Init handler
	websocket := ws.New(hub)
	http.New(e, services, websocket)
	// Start server
	err := e.Start(":8080")
	if err != nil {
		return
	}
}
