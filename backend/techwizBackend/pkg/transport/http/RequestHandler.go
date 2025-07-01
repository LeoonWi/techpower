package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"techwizBackend/pkg/models"
)

func (h *Handler) createRequest(c echo.Context) error {
	var request models.Request
	if err := c.Bind(&request); err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid request body"},
		)
	}

	if status, err := h.services.RequestService.Create(&request); err != nil {
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, map[string]string{"status": "Request created"})
}
