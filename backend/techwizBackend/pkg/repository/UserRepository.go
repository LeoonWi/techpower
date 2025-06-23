package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models/dao"
)

type (
	IUserRepository interface {
		GetUserByPhone(phone string, res *dao.User) error
		GetUserById(id bson.ObjectID, res *dao.User) error
		ChangePassword(id bson.ObjectID, input string) error
	}

	UserRepository struct {
		db *mongo.Client
	}
)

func NewUserRepository(db *mongo.Client) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetUserByPhone(phone string, res *dao.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	if err := coll.FindOne(context.TODO(), bson.M{"phone_number": phone}).Decode(res); err != nil {
		return errors.New("User not found")
	}
	return nil
}

func (r *UserRepository) GetUserById(id bson.ObjectID, res *dao.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	if err := coll.FindOne(context.TODO(), bson.M{"_id": id}).Decode(res); err != nil {
		return errors.New("User not found")
	}
	return nil
}

func (r *UserRepository) ChangePassword(id bson.ObjectID, input string) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filder := bson.D{{"_id", id}}
	update := bson.D{{"$set", bson.D{{"password", input}}}}

	if _, err := coll.UpdateOne(context.TODO(), filder, update); err != nil {
		return errors.New("Failed update user password")
	}
	return nil
}
