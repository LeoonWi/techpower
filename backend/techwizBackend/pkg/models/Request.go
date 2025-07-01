package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

type Status struct {
	StatusCode int    `json:"status_code,omitempty" bson:"status_code,omitempty"`
	Reason     string `json:"reason,omitempty" bson:"reason,omitempty"`
}

type Request struct {
	Id          *bson.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	FullName    string         `json:"full_name,omitempty" bson:"full_name,omitempty"`
	PhoneNumber string         `json:"phone_number,omitempty" bson:"phone_number,omitempty"`
	Address     string         `json:"address,omitempty" bson:"address,omitempty"`
	Problem     string         `json:"problem,omitempty" bson:"problem,omitempty"`
	Price       float64        `json:"price,omitempty" bson:"price,omitempty"`
	Status      Status         `json:"status,omitempty" bson:"status,omitempty"`
	FilesDTO    []FileDTO      `json:"files,omitempty" bson:"-"`
	FilesDAO    []FileDAO      `json:"-" bson:"files,omitempty"`
	DateTime    time.Time      `json:"datetime,omitempty" bson:"datetime,omitempty"`
	Category    Category       `json:"category,omitempty" bson:"category,omitempty"`
	CategoryId  bson.ObjectID  `json:"category_id,omitempty" bson:"category_id,omitempty"`
	Worker      User           `json:"worker,omitempty" bson:"worker,omitempty"`
	WorkerId    bson.ObjectID  `json:"worker_id,omitempty" bson:"worker_id,omitempty"`
}
