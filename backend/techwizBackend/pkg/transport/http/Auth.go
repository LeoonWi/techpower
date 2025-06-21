package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"techwizBackend/pkg/models/dto/userDTO"
	"techwizBackend/pkg/models/user"
)

func (h Handler) signup(c echo.Context) error {
	var input userDTO.User
	if err := c.Bind(&input); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid request body"},
		)
	}

	var user user.User
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

func (h Handler) signin(c echo.Context) error {
	var input userDTO.User
	if err := c.Bind(&input); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid request body"},
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
		map[string]string{"id": input.PhoneNumber},
	)
}
