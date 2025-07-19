package ws

import (
	"log"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/service"

	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Hub struct {
	services  *service.Service
	Clients   map[bson.ObjectID]*websocket.Conn
	Broadcast chan models.Message
	Add       chan models.User
	Remove    chan bson.ObjectID
}

func NewHub(services *service.Service) *Hub {
	return &Hub{
		services:  services,
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
			log.Printf("клиент %s подключён | всего клиентов: %d", user.Id.Hex(), len(h.Clients))

		case id := <-h.Remove:
			if _, ok := h.Clients[id]; ok {
				delete(h.Clients, id)
				log.Printf("клиент отключён | всего клиентов: %d", len(h.Clients))
			}

		case message := <-h.Broadcast:
			if err := h.services.MessageService.Save(&message); err != nil {
				message.Conn.WriteJSON(map[string]string{"error": err.Error()})
				continue
			}
			recipients := h.services.ChatService.GetRecipient(&message)
			for _, item := range recipients {
				log.Println(message)
				if conn, ok := h.Clients[item]; ok {
					if err := conn.WriteJSON(&message); err != nil {
						log.Printf("write error: %s", err)
						if err := h.Clients[item].Close(); err != nil {
							log.Printf("Не удалось разорвать соединение: %v", err)
						}
						delete(h.Clients, item)
					}
				}
			}
		}
	}
}
