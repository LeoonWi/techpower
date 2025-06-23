package dto

import "github.com/gorilla/websocket"

type Message struct {
	Id         string          `json:"id,omitempty"`
	SenderId   string          `json:"sender_id,omitempty"`
	SenderConn *websocket.Conn `json:"-"`
	Chat       string          `json:"chat_id,omitempty"`
	Text       string          `json:"text,omitempty"`
	Files      []File          `json:"files,omitempty"`
	CreatedAt  string          `json:"created_at,omitempty"` // format time.RFC3339
}
