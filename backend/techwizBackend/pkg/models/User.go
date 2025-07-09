package models

import (
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	Id          bson.ObjectID   `json:"id,omitempty" bson:"_id,omitempty"`
	Conn        *websocket.Conn `json:"-" bson:"-"`
	PhoneNumber string          `json:"phone_number" bson:"phone_number"`
	FullName    string          `json:"full_name,omitempty" bson:"full_name,omitempty"`
	Password    string          `json:"password,omitempty" bson:"password"`
	Permission  string          `json:"permission,omitempty" bson:"permission,omitempty"`
	Photo       string          `json:"photo,omitempty" bson:"photo,omitempty"`
	Nickname    string          `json:"nickname,omitempty" bson:"nickname,omitempty"`     // superadmin and master
	Status      string          `json:"status,omitempty" bson:"status,omitempty"`         // only master // default, senior or premium
	Category    []Category      `json:"categories,omitempty" bson:"categories,omitempty"` // only master
	CategoryId  []bson.ObjectID `json:"categories_id,omitempty" bson:"categories_id,omitempty"`
	Balance     float32         `json:"balance,omitempty" bson:"balance,omitempty"`       // only master
	Commission  int             `json:"commission,omitempty" bson:"commission,omitempty"` // only master
	Dismissed   bool            `json:"dismissed" bson:"dismissed"`
}

const (
	Default string = "default"
	Senior  string = "senior"
	Premium string = "premium"
)

func (s User) IsValid() bool {
	switch s.Status {
	case Default, Senior, Premium:
		return true
	default:
		return false
	}
}
