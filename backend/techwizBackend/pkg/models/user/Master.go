package user

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"techwizBackend/pkg/models/category"
)

type Status string

const (
	Defualt Status = "defualt"
	Senior  Status = "senior"
	Premium Status = "premium"
)

func (s Status) IsValid() bool {
	switch s {
	case Defualt, Senior, Premium:
		return true
	default:
		return false
	}
}

type Master struct {
	Id          bson.ObjectID       `bson:"_id,omitempty"`
	Fullname    string              `bson:"fullname,omitempty"`
	PhoneNumber string              `bson:"phone_number,omitempty"`
	Password    string              `bson:"password,omitempty"`
	Nickname    string              `bson:"nickname,omitempty"`
	Photo       string              `bson:"photo,omitempty"`
	Status      Status              `bson:"status,omitempty"` // default, senior or premium
	Category    []category.Category `bson:"category,omitempty"`
	Balance     float32             `bson:"balance,omitempty"`
	Commission  int                 `bson:"commission,omitempty"`
}
