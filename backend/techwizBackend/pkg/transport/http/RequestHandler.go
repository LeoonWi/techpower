package http

import (
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/v2/bson"
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

func (h Handler) attachMasterToRequest(c echo.Context) error {
	requestId, err := bson.ObjectIDFromHex(c.Param("requestId"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid requestId"})
	}

	userId, err := bson.ObjectIDFromHex(c.Param("userId"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid userId"})
	}

	var request models.Request
	status, err := h.services.RequestService.AttachMaster(requestId, userId, &request)
	if err != nil {
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return c.JSON(status, request)
}

func (h Handler) getRequest(c echo.Context) error {
	id, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid id"})
	}

	var request models.Request
	status, err := h.services.RequestService.GetRequest(id, &request)
	if err != nil {
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return c.JSON(status, &request)
}

func (h Handler) changeStatusRequest(c echo.Context) error {
	requestId, err := bson.ObjectIDFromHex(c.QueryParam("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid requestId"})
	}
	var newStatus models.Status
	if err := c.Bind(&newStatus); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid status object"})
	}

	status, err := h.services.RequestService.ChangeStatus(requestId, &newStatus)
	if err != nil {
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return c.JSON(status, map[string]any{"id": requestId.Hex(), "status": newStatus})
}

func (h Handler) changeRequest(c echo.Context) error {
	id, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid request user id"},
		)
	}

	var request models.Request
	if err := c.Bind(&request); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid request body"},
		)
	}

	err = h.services.RequestService.UpdateRequest(id, &request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, &request)
}

func (h Handler) requestInSpot(c echo.Context) error {
	id, err := bson.ObjectIDFromHex(c.QueryParam("id"))
	if err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid requestId"},
		)
	}

	if err := h.services.RequestService.InSpot(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
