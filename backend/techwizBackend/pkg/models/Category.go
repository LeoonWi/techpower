package models

import "go.mongodb.org/mongo-driver/v2/bson"

type Category struct {
	Id   bson.ObjectID `json:"id" bson:"_id,omitempty"`
	Name string        `json:"name" bson:"name,omitempty"`
}
