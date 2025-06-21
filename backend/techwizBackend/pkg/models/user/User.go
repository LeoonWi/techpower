package user

import "go.mongodb.org/mongo-driver/v2/bson"

type User struct {
	Id          bson.ObjectID `bson:"_id,omitempty"`
	PhoneNumber string        `bson:"phone_number"`
	Password    string        `bson:"password"`
	Permission  int           `bson:"permission,omitempty"`
}
