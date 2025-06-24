package dto

import (
	"github.com/gorilla/websocket"
)

type User struct {
	Id          string          `json:"id,omitempty"`
	Conn        *websocket.Conn `json:"-"`
	PhoneNumber string          `json:"phone_number"`
	FullName    string          `json:"full_name,omitempty"`
	Password    string          `json:"password,omitempty"`
	Permission  string          `json:"permission,omitempty"`
	Photo       string          `json:"photo,omitempty"`
	Nickname    string          `json:"nickname,omitempty"`   // superadmin and master
	Category    []Category      `json:"category,omitempty"`   // only master
	Status      string          `json:"status,omitempty"`     // only master // default, senior or premium
	Balance     float32         `json:"balance,omitempty"`    // only master
	Commission  int             `json:"commission,omitempty"` // only master
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
