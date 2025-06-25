package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	IUserRepository interface {
		GetUserByPhone(phone string, res *models.User) error
		GetUserById(id bson.ObjectID, res *models.User) error
		ChangePassword(id bson.ObjectID, password string) error
		ChangePermission(id bson.ObjectID, permission string) error
	}

	UserRepository struct {
		db *mongo.Client
	}
)

func NewUserRepository(db *mongo.Client) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetUserByPhone(phone string, res *models.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	if err := coll.FindOne(context.TODO(), bson.M{"phone_number": phone}).Decode(res); err != nil {
		return errors.New("User not found")
	}
	return nil
}

func (r *UserRepository) GetUserById(id bson.ObjectID, res *models.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	if err := coll.FindOne(context.TODO(), bson.M{"_id": id}).Decode(res); err != nil {
		return errors.New("User not found")
	}
	return nil
}

func (r *UserRepository) ChangePassword(id bson.ObjectID, password string) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filter := bson.D{{"_id", id}}
	update := bson.D{{"$set", bson.D{{"password", password}}}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed update user password")
	}
	return nil
}

func (r *UserRepository) ChangePermission(id bson.ObjectID, permission string) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filter := bson.D{{"_id", id}}
	update := bson.D{{"$set", bson.D{{"permission", permission}}}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed update user permission")
	}

	return nil
}
