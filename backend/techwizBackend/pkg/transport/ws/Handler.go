package ws

import (
	"log"
	"net/http"
	"techwizBackend/pkg/models"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type WebsocketConnection struct {
	Hub *Hub
}

func New(hub *Hub) *WebsocketConnection {
	ws := WebsocketConnection{Hub: hub}
	return &ws
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  16384,
	WriteBufferSize: 16384,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (wsConn *WebsocketConnection) Ws(c echo.Context) error {
	id, _ := bson.ObjectIDFromHex(c.QueryParam("id"))
	conn, err := upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("Не удалось разорвать соединение: %v", err)
		}
	}()

	if err != nil {
		log.Println(err)
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Failed to upgrade connection"},
		)
	}

	// Add new user connection to Hub
	user := models.User{Id: id, Conn: conn}
	wsConn.Hub.Add <- user

	for {
		var message models.Message
		if err := conn.ReadJSON(&message); err != nil {
			// If the error is a connection closure
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				log.Printf("Клиент %s закрыл соединение", id)
				wsConn.Hub.Remove <- user.Id
				return nil
			} else {
				log.Printf("read error from client %s: %s", id, err)
				continue
			}
		}

		message.SenderId = user.Id
		message.Conn = user.Conn
		wsConn.Hub.Broadcast <- message
	}
}
