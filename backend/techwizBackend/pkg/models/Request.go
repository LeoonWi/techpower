package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

// StatusCode can be 1,2,3,4,5
// 1 = waiting
// 2 = appointed
// 3 = in work
// 4 = completed
// 5 = upgrade
// 6 = canceled
// 7 = rejected
type Status struct {
	Code        int     `json:"code,omitempty" bson:"code,omitempty"`
	Reason      string  `json:"reason,omitempty" bson:"reason,omitempty"`
	PriceIsBail float64 `json:"price_is_bail,omitempty" bson:"price_is_bail,omitempty"`
	//FilesDTO    []FileDTO `json:"files,omitempty" bson:"-"`
	//FilesDAO    []FileDAO `json:"-" bson:"files,omitempty"`
}

type Request struct {
	Id          bson.ObjectID  `json:"id,omitempty" bson:"_id,omitempty"`
	FullName    string         `json:"full_name,omitempty" bson:"full_name,omitempty"`
	PhoneNumber string         `json:"phone_number,omitempty" bson:"phone_number,omitempty"`
	Address     string         `json:"address,omitempty" bson:"address,omitempty"`
	Problem     string         `json:"problem,omitempty" bson:"problem,omitempty"`
	Price       float64        `json:"price,omitempty" bson:"price,omitempty"`
	Status      Status         `json:"status,omitempty" bson:"status,omitempty"`
	InSpot      bool           `json:"in_spot,omitempty" bson:"in_spot,omitempty"`
	Premium     bool           `json:"premium,omitempty" bson:"premium,omitempty"`
	DateTime    time.Time      `json:"datetime,omitempty" bson:"datetime,omitempty"`
	Category    *Category      `json:"category,omitempty" bson:"category,omitempty"`
	CategoryId  *bson.ObjectID `json:"category_id,omitempty" bson:"category_id,omitempty"`
	Commission  float64        `json:"commission,omitempty" bson:"commission,omitempty"`
	Worker      *User          `json:"worker,omitempty" bson:"worker,omitempty"`
	WorkerId    *bson.ObjectID `json:"worker_id,omitempty" bson:"worker_id,omitempty"`
	CreatedAt   time.Time      `json:"created_at,omitempty" bson:"created_at,omitempty"`
}
