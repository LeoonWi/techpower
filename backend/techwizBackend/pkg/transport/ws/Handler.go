package ws

import (
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"log"
	"net/http"
	"techwizBackend/pkg/models/dto"
	"techwizBackend/pkg/repository/wsRepository"
)

type WebsocketConnection struct {
	Hub *wsRepository.Hub
}

func New(hub *wsRepository.Hub) *WebsocketConnection {
	ws := WebsocketConnection{Hub: hub}
	return &ws
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (wsConn *WebsocketConnection) Ws(c echo.Context) error {
	id := c.QueryParam("id")
	conn, err := upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
	if err != nil {
		log.Println(err)
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Failed to upgrade connection"},
		)
	}

	// Add new user connection to Hub
	wsConn.Hub.Add <- dto.User{Id: id, Conn: conn}

	for {
		var message dto.Message
		if err := conn.ReadJSON(&message); err != nil {
			// If the error is a connection closure
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				log.Printf("Клиент %s закрыл соединение", id)
				wsConn.Hub.Remove <- conn
				return nil
			} else {
				log.Printf("read error from client %s: %s", id, err)
				continue
			}
		}

		message.SenderConn = conn
		wsConn.Hub.Broadcast <- message
	}
}
