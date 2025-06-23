package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"techwizBackend/pkg/models/dao"
	"techwizBackend/pkg/models/dto"
)

func (h *Handler) signup(c echo.Context) error {
	var input dto.User
	if err := c.Bind(&input); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid request body"},
		)
	}

	var user dao.User
	user.PhoneNumber = input.PhoneNumber
	user.Password = input.Password
	id, err := h.services.Authorization.CreateUser(user)
	if err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": err.Error()},
		)
	}

	return c.JSON(
		http.StatusOK,
		map[string]string{"id": id},
	)
}

func (h *Handler) signin(c echo.Context) error {
	var input dto.User
	if err := c.Bind(&input); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid request body"},
		)
	}

	if len(input.Permission) != 4 {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid string permission"},
		)
	}

	if err := h.services.Authorization.Login(&input); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": err.Error()},
		)
	}
	return c.JSON(
		http.StatusOK,
		map[string]string{"phone_number": input.Id},
	)
}
