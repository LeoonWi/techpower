package models

import "go.mongodb.org/mongo-driver/v2/bson"

type Chat struct {
	Id         *bson.ObjectID  `json:"id,omitempty" bson:"_id,omitempty"`
	Name       string          `json:"name,omitempty" bson:"name,omitempty"`
	Members    []User          `json:"members,omitempty" bson:"members,omitempty"`
	MembersId  []bson.ObjectID `json:"members_id,omitempty" bson:"members_id,omitempty"`
	Category   *Category       `json:"category,omitempty" bson:"category,omitempty"`
	CategoryId *bson.ObjectID  `json:"category_id,omitempty" bson:"category_id,omitempty"`
}
