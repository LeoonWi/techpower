package http

import (
	"github.com/labstack/echo/v4"
	"techwizBackend/pkg/service"
)

type Handler struct {
	services *service.Service
}

func New(e *echo.Echo, service *service.Service) *Handler {
	h := Handler{services: service}
	// TODO enable JWT

	auth := e.Group("auth")
	auth.POST("/signup", h.signup)
	auth.POST("/signin", h.signin)

	user := e.Group("user")
	user.PATCH("/changepassword", h.changePassword)

	return &h
}
