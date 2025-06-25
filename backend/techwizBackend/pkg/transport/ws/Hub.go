package ws

import (
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/v2/bson"
	"log"
	"techwizBackend/pkg/models"
)

type Hub struct {
	Clients   map[bson.ObjectID]*websocket.Conn
	Broadcast chan models.Message
	Add       chan models.User
	Remove    chan bson.ObjectID
}

func NewHub() *Hub {
	return &Hub{
		Clients:   make(map[bson.ObjectID]*websocket.Conn),
		Broadcast: make(chan models.Message, 50),
		Add:       make(chan models.User, 50),
		Remove:    make(chan bson.ObjectID, 50),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case user := <-h.Add:
			h.Clients[user.Id] = user.Conn
			log.Printf("клиент подключён | всего клиентов: %d", len(h.Clients))

		case id := <-h.Remove:
			if conn, ok := h.Clients[id]; ok {
				delete(h.Clients, id)
				if err := conn.Close(); err != nil {
					log.Printf("Не удалось разорвать соединение: %v", err)
				}
				log.Printf("клиент отключён | всего клиентов: %d", len(h.Clients))
			}

		case message := <-h.Broadcast:
			for id, conn := range h.Clients {
				if id == message.SenderId {
					continue
				}
				err := conn.WriteJSON(message)
				if err != nil {
					log.Printf("write error: %s", err)
					delete(h.Clients, id)
					if err := conn.Close(); err != nil {
						log.Printf("Не удалось разорвать соединение: %v", err)
					}
				}
			}
		}
	}
}
