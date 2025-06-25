package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"techwizBackend/pkg/models"
)

func (h *Handler) createChat(c echo.Context) error {
	var chat models.Chat
	if err := c.Bind(&chat); err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid request body"},
		)
	}

	status, err := h.services.ChatService.Create(&chat)
	if err != nil {
		return c.JSON(status, err.Error())
	}
	return c.JSON(status, chat)
}
