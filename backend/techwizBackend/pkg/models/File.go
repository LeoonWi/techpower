package models

import "go.mongodb.org/mongo-driver/v2/bson"

type File struct {
	Id          bson.ObjectID `bson:"_id,omitempty"`
	Name        string        `bson:"name,omitempty"`
	Path        string        `bson:"path,omitempty"`
	ContentType string        `bson:"content_type,omitempty"`
}
