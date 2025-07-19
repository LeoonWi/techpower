package http

import (
	"net/http"
	"techwizBackend/pkg/models"

	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (h Handler) createChat(c echo.Context) error {
	member1, _ := bson.ObjectIDFromHex(c.Param("member1"))
	member2, _ := bson.ObjectIDFromHex(c.Param("member2"))
	var chat models.Chat
	if err := c.Bind(&chat); err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid request body"},
		)
	}

	chat.MembersId = append(chat.MembersId, member1)
	chat.MembersId = append(chat.MembersId, member2)
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

func (h Handler) getChats(c echo.Context) error {
	id, err := bson.ObjectIDFromHex(c.Param("userId"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, h.services.ChatService.GetChats(id))
}

func (h Handler) addUserToChat(c echo.Context) error {
	var err error
	idChat, err := bson.ObjectIDFromHex(c.Param("idChat"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid idChat"})
	}
	idUser, err := bson.ObjectIDFromHex(c.Param("idUser"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid idUser"})
	}

	if err := h.services.ChatService.AddUser(idChat, idUser); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (h Handler) removeUserFromChat(c echo.Context) error {
	var err error
	idChat, err := bson.ObjectIDFromHex(c.Param("idChat"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid idChat"})
	}
	idUser, err := bson.ObjectIDFromHex(c.Param("idUser"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid idUser"})
	}

	if err := h.services.ChatService.RemoveUser(idChat, idUser); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (h Handler) getMessageByChat(c echo.Context) error {
	chat_id, err := bson.ObjectIDFromHex(c.QueryParam("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}
	return c.JSON(h.services.MessageService.GetMessageByChat(chat_id))
}
