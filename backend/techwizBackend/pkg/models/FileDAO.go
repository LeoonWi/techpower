package models

import "go.mongodb.org/mongo-driver/v2/bson"

type FileDAO struct {
	Id      *bson.ObjectID `bson:"_id,omitempty"`
	Content []byte         `bson:"content,omitempty"`
}
