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
	Remove    chan *websocket.Conn
}

func New() *Hub {
	return &Hub{
		Clients:   make(map[*websocket.Conn]string),
		Broadcast: make(chan dto.Message, 50),
		Add:       make(chan dto.User, 50),
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
