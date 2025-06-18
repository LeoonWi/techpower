package handler

import "github.com/labstack/echo/v4"

type Handler struct{}

func New(e *echo.Echo) *Handler {
	h := Handler{}
	e.Group("auth")
	{
		e.POST("signup", nil)
		e.POST("signin", nil)
	}
	return &h
}
