package user

import "go.mongodb.org/mongo-driver/v2/bson"

type Admin struct {
	Id          bson.ObjectID `bson:"_id,omitempty"`
	Fullname    string        `bson:"fullname,omitempty"`
	PhoneNumber string        `bson:"phone_number,omitempty"`
	Password    string        `bson:"password,omitempty"`
}
