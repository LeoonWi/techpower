package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

type Status struct {
	StatusCode int    `bson:"status_code,omitempty"`
	Reason     string `bson:"reason,omitempty"`
}

type Request struct {
	Id          *bson.ObjectID `bson:"_id,omitempty"`
	Name        string         `bson:"name,omitempty"`
	PhoneNumber string         `bson:"phone_number,omitempty"`
	Address     string         `bson:"address,omitempty"`
	Comment     string         `bson:"comment,omitempty"`
	Price       float64        `bson:"price,omitempty"`
	Status      Status         `bson:"status,omitempty"`
	Files       []File         `bson:"files,omitempty"`
	DateTime    time.Time      `bson:"datetime,omitempty"`
	CategoryId  bson.ObjectID  `bson:"category_id,omitempty"`
	WorkerId    bson.ObjectID  `bson:"worker_id,omitempty"`
}
