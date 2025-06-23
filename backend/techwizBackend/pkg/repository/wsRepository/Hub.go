package wsRepository

import (
	"github.com/gorilla/websocket"
	"log"
	"techwizBackend/pkg/models/dto"
)

type Hub struct {
	Clients   map[*websocket.Conn]string
	Broadcast chan dto.Message
	Add       chan dto.User
	Remove    chan dto.User
}

func New() *Hub {
	return &Hub{}
}

func (h *Hub) Run() {
	for {
		select {
		case user := <-h.Add:
			h.Clients[user.Conn] = user.Id
			log.Printf("клиент подключён | всего клиентов: %d", len(h.Clients))

		case user := <-h.Remove:
			if _, ok := h.Clients[user.Conn]; ok {
				delete(h.Clients, user.Conn)
				if err := user.Conn.Close(); err != nil {
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
