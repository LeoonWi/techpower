package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"techwizBackend/pkg/models"
)

func (h *Handler) changePassword(c echo.Context) error {
	var user models.User
	if err := c.Bind(&user); err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid request body"},
		)
	}

	// validation data
	if len(user.Id.Hex()) < 24 || len(user.Password) < 6 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid id or password"})
	}

	status := 0
	if err := h.services.UserService.ChangePassword(&user, &status); err != nil {
		return c.JSON(
			status,
			map[string]string{"error": err.Error()},
		)
	}

	return c.JSON(
		status,
		map[string]string{"status": "ok"},
	)
}

func (h *Handler) changePermission(c echo.Context) error {
	var user models.User
	if err := c.Bind(&user); err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid request body"},
		)
	}

	var status int
	if err := h.services.UserService.ChangePermission(&user, &status); err != nil {
		return c.JSON(status, err.Error())
	}

	return c.JSON(
		status,
		map[string]string{"status": "ok"},
	)
}

func (h *Handler) getUser(c echo.Context) error {
	id := c.QueryParam("id")
	if len(id) < 24 {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid id"},
		)
	}

	var status int
	var user models.User
	if err := h.services.UserService.GetUser(id, &user, &status); err != nil {
		return c.JSON(
			status,
			map[string]string{"error": err.Error()},
		)
	}

	return c.JSON(status, user)
}
