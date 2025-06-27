package http

import (
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/v2/bson"
	"net/http"
	"techwizBackend/pkg/models"
)

func (h Handler) createCategory(c echo.Context) error {
	var category models.Category
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
	id, _ := bson.ObjectIDFromHex(c.QueryParam("id"))
	name := c.QueryParam("name")
	category := models.Category{Id: &id, Name: name}

	var status int
	if err := h.services.CategoryService.Rename(&category, &status); err != nil {
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return c.JSON(status, category)
}

func (h Handler) removeCategory(c echo.Context) error {
	var category models.Category
	if err := c.Bind(&category); err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid request body"},
		)
	}

	status, err := h.services.CategoryService.Remove(&category)
	if err != nil {
		return c.JSON(
			status,
			map[string]string{"error": err.Error()},
		)
	}

	return c.JSON(status, category)
}
