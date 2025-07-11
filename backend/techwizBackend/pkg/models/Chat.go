package models

import "go.mongodb.org/mongo-driver/v2/bson"

// first member is always the owner, unless the chat is a group
type Chat struct {
	Id         *bson.ObjectID  `json:"id,omitempty" bson:"_id,omitempty"`
	Name       string          `json:"name,omitempty" bson:"name,omitempty"`
	MembersId  []bson.ObjectID `json:"members_id,omitempty" bson:"members_id,omitempty"`
	Category   *Category       `json:"category,omitempty" bson:"category,omitempty"`
	CategoryId *bson.ObjectID  `json:"category_id,omitempty" bson:"category_id,omitempty"`
}
