package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"techwizBackend/pkg/models/dto"
)

func (h Handler) createCategory(c echo.Context) error {
	var category dto.Category
	if err := c.Bind(&category); err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid request body"},
		)
	}

	if category.Name == "" {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Category name is required"},
		)
	}

	var status int
	if err := h.services.CategoryService.Create(&category, &status); err != nil {
		return c.JSON(
			status,
			map[string]string{"error": err.Error()},
		)
	}

	return c.JSON(status, category)
}

func (h Handler) renameCategory(c echo.Context) error {
	id := c.QueryParam("id")
	name := c.QueryParam("name")

	if id == "" || name == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "id and name are required"})
	}

	var status int
	if err := h.services.CategoryService.Rename(id, name, &status); err != nil {
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return c.JSON(status, map[string]string{
		"id":   id,
		"name": name,
	})
}
