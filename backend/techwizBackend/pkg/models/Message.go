package models

import (
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

type Message struct {
	Id          bson.ObjectID   `json:"id,omitempty" bson:"_id,omitempty"`
	Conn        *websocket.Conn `json:"-" bson:"-"`
	SenderId    bson.ObjectID   `json:"sender_id" bson:"sender_id"`
	RecipientId *bson.ObjectID  `json:"recipient_id" bson:"recipient_id"`
	Chat        bson.ObjectID   `json:"chat_id" bson:"chat_id"`
	Text        string          `json:"text,omitempty" bson:"text,omitempty"`
	Files       []File          `json:"files,omitempty" bson:"files,omitempty"`
	CreatedAt   time.Time       `json:"created_at,omitempty" bson:"created_at,omitempty"` // format time.RFC3339
}
