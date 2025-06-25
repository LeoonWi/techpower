package ws

import (
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/v2/bson"
	"log"
	"techwizBackend/pkg/models"
)

type Hub struct {
	Clients   map[*websocket.Conn]bson.ObjectID
	Broadcast chan models.Message
	Add       chan models.User
	Remove    chan *websocket.Conn
}

func NewHub() *Hub {
	return &Hub{
		Clients:   make(map[*websocket.Conn]bson.ObjectID),
		Broadcast: make(chan models.Message, 50),
		Add:       make(chan models.User, 50),
		Remove:    make(chan *websocket.Conn, 50),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case user := <-h.Add:
			h.Clients[user.Conn] = user.Id
			log.Printf("клиент подключён | всего клиентов: %d", len(h.Clients))

		case conn := <-h.Remove:
			if _, ok := h.Clients[conn]; ok {
				delete(h.Clients, conn)
				if err := conn.Close(); err != nil {
					log.Printf("Не удалось разорвать соединение: %v", err)
				}
				log.Printf("клиент отключён | всего клиентов: %d", len(h.Clients))
			}

		case message := <-h.Broadcast:
			for conn := range h.Clients {
				if conn == message.SenderConn {
					continue
				}
				err := conn.WriteJSON(message)
				if err != nil {
					log.Printf("write error: %s", err)
					delete(h.Clients, conn)
					if err := conn.Close(); err != nil {
						log.Printf("Не удалось разорвать соединение: %v", err)
					}
				}
			}
		}
	}
}
