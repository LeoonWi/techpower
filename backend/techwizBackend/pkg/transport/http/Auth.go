package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"techwizBackend/pkg/models/user"
)

func (h Handler) signup(c echo.Context) error {
	// TODO
	var input user.User
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	id, err := h.services.Authorization.CreateUser(input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id": id,
	})
}

func (h Handler) signin(c echo.Context) error {
	// TODO
	return nil
}
