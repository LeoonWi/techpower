package models

import (
	"time"

	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Message struct {
	Id             bson.ObjectID   `json:"id,omitempty" bson:"_id,omitempty"`
	Conn           *websocket.Conn `json:"-" bson:"-"`
	SenderId       bson.ObjectID   `json:"sender_id,omitempty" bson:"sender_id"`
	SenderFullName string          `json:"sender_full_name,omitempty" bson:"sender_full_name"`
	RecipientId    *bson.ObjectID  `json:"recipient_id" bson:"recipient_id"`
	Chat           bson.ObjectID   `json:"chat_id,omitempty" bson:"chat_id"`
	Text           string          `json:"text,omitempty" bson:"text,omitempty"`
	CreatedAt      time.Time       `json:"created_at,omitempty" bson:"created_at,omitempty"` // format time.RFC3339
}
