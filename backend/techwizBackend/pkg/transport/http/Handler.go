package http

import (
	"github.com/labstack/echo/v4"
	"techwizBackend/pkg/service"
	"techwizBackend/pkg/transport/ws"
)

type Handler struct {
	services *service.Service
}

func New(e *echo.Echo, service *service.Service, websocketConn *ws.WebsocketConnection) *Handler {
	h := Handler{services: service}
	// TODO enable JWT

	auth := e.Group("auth")
	auth.POST("/signup", h.signup)
	auth.POST("/signin", h.signin)

	category := e.Group("category")
	category.POST("", h.createCategory)
	category.PUT("", h.renameCategory)

	user := e.Group("user")
	user.PATCH("/changepassword", h.changePassword)
	user.PATCH("/changepermission", h.changePermission)
	user.GET("", h.getUser)

	//request := e.Group("request")
	//request.POST("/create", h.createRequest)

	e.GET("/ws", func(c echo.Context) error {
		return websocketConn.Ws(c)
	})

	return &h
}
