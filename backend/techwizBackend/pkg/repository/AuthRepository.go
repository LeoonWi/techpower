package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"log"
	"techwizBackend/pkg/models/user"
)

type (
	IAuthRepository interface {
		CreateUser(user user.User) (string, error)
		GetUserByPhone(phone string) (*user.User, error)
	}
	AuthRepository struct {
		db *mongo.Client
	}
)

func NewAuthRepository(db *mongo.Client) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r AuthRepository) CreateUser(user user.User) (string, error) {
	coll := r.db.Database("TechPower").Collection("Users")
	var result *mongo.InsertOneResult
	var err error
	if result, err = coll.InsertOne(context.TODO(), user); err != nil {
		log.Println(err)
		return "-1", err
	}
	return result.InsertedID.(bson.ObjectID).Hex(), nil
}

func (r AuthRepository) GetUserByPhone(phone string) (*user.User, error) {
	var user user.User
	coll := r.db.Database("TechPower").Collection("Users")
	if err := coll.FindOne(context.TODO(), bson.M{"phone": phone}).Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}
