package http

import (
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/v2/bson"
	"net/http"
	"techwizBackend/pkg/models"
)

func (h *Handler) createChat(c echo.Context) error {
	//sender, _ := bson.ObjectIDFromHex(c.Param("sender"))
	//recipient, _ := bson.ObjectIDFromHex(c.Param("recipient"))
	var chat models.Chat
	if err := c.Bind(&chat); err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid request body"},
		)
	}

	status, err := h.services.ChatService.Create(&chat)
	if err != nil {
		return c.JSON(status, err.Error())
	}
	return c.JSON(status, chat)
}

func (h Handler) getChatByMember(c echo.Context) error {
	member1, _ := bson.ObjectIDFromHex(c.Param("member1"))
	member2, _ := bson.ObjectIDFromHex(c.Param("member2"))

	if member1.IsZero() && member2.IsZero() {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Both id is required"})
	}

	return c.JSON(http.StatusOK, h.services.ChatService.GetChatByMember(member1, member2))
}
