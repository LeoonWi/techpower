package models

import "go.mongodb.org/mongo-driver/v2/bson"

type Category struct {
	Id   *bson.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name string         `json:"name,omitempty" bson:"name,omitempty"`
}
