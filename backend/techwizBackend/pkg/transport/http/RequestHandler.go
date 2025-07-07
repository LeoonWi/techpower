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

func (h *Handler) getRequests(c echo.Context) error {
	requests, err := h.services.RequestService.GetAll()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, requests)
}

func (h *Handler) getRequestByID(c echo.Context) error {
	id := c.Param("id")
	request, err := h.services.RequestService.GetByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, request)
}

func (h *Handler) updateRequest(c echo.Context) error {
	id := c.Param("id")
	var req models.Request
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid request body"})
	}
	if err := h.services.RequestService.Update(id, &req); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "Request updated", "id": id})
}

func (h *Handler) deleteRequest(c echo.Context) error {
	id := c.Param("id")
	if err := h.services.RequestService.Delete(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "Request deleted", "id": id})
}
