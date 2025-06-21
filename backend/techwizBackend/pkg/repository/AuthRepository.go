package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"log"
	"techwizBackend/pkg/models/user"
)

type (
	IAuthRepository interface {
		CreateUser(val user.User) (string, error)
		GetUserByPhone(phone string, res *user.User) error
	}
	AuthRepository struct {
		db *mongo.Client
	}
)

func NewAuthRepository(db *mongo.Client) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r AuthRepository) CreateUser(val user.User) (string, error) {
	coll := r.db.Database("TechPower").Collection("Users")
	var result *mongo.InsertOneResult
	var err error
	if result, err = coll.InsertOne(context.TODO(), val); err != nil {
		log.Println(err)
		return "-1", errors.New("Failed to create user")
	}
	return result.InsertedID.(bson.ObjectID).Hex(), nil
}

func (r AuthRepository) GetUserByPhone(phone string, res *user.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	if err := coll.FindOne(context.TODO(), bson.M{"phone_number": phone}).Decode(res); err != nil {
		return errors.New("User not found")
	}
	return nil
}
