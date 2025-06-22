package dao

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	Id          bson.ObjectID `bson:"_id,omitempty"`
	PhoneNumber string        `bson:"phone_number"`
	FullName    string        `bson:"full_name,omitempty"`
	Password    string        `bson:"password"`
	Permission  string        `bson:"permission,omitempty"`
	Photo       string        `bson:"photo,omitempty"`
	Nickname    string        `bson:"nickname,omitempty"`   // superadmin and master
	Status      string        `bson:"status,omitempty"`     // only master // default, senior or premium
	Category    []Category    `bson:"category,omitempty"`   // only master
	Balance     float32       `bson:"balance,omitempty"`    // only master
	Commission  int           `bson:"commission,omitempty"` // only master
}
