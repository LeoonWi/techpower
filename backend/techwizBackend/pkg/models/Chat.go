package models

import "go.mongodb.org/mongo-driver/v2/bson"

type Chat struct {
	Id         bson.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name       string        `json:"name,omitempty" bson:"name,omitempty"`
	Owner      User          `json:"owner,omitempty" bson:"owner,omitempty"`
	OwnerId    bson.ObjectID `json:"owner_id,omitempty" bson:"owner_id,omitempty"`
	Category   Category      `json:"category,omitempty" bson:"category,omitempty"`
	CategoryId bson.ObjectID `json:"category_id,omitempty" bson:"category_id,omitempty"`
}
