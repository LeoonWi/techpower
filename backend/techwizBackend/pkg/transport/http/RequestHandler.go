package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"techwizBackend/pkg/models"
)

// ----------------------------------
//
//	JSON {
//		full_name
//		phone_number
//	 	address "г.Москва,д.10,кв.10"
//	 	problem
//	 	price
//	 	datetime "2025-07-05T18:05:00Z"
//	 	category_id
//	}
//
// ----------------------------------
func (h Handler) createRequest(c echo.Context) error {
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

func (h Handler) getRequests(c echo.Context) error {

	return c.JSON(http.StatusOK, map[string]*[]models.Request{"requests": h.services.RequestService.GetRequests()})
}
