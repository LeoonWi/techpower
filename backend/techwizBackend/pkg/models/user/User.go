package user

import "go.mongodb.org/mongo-driver/v2/bson"

type (
	User struct {
		Id          bson.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
		PhoneNumber string        `json:"phone_number,omitempty" bson:"phone_number"`
		Password    string        `json:"password,omitempty" bson:"password"`
		Permission  int           `json:"permission,omitempty" bson:"permission,omitempty"`
	}
)
