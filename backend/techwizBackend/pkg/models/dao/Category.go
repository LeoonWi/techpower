package dao

import "go.mongodb.org/mongo-driver/v2/bson"

type Category struct {
	Id   bson.ObjectID `bson:"_id,omitempty"`
	Name string        `bson:"name,omitempty"`
}
