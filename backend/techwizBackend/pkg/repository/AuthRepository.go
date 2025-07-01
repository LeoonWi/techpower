package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	IAuthRepository interface {
		CreateUser(user *models.User) error
	}
	AuthRepository struct {
		db *mongo.Client
	}
)

func NewAuthRepository(db *mongo.Client) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) CreateUser(user *models.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	var result *mongo.InsertOneResult
	var err error
	if result, err = coll.InsertOne(context.TODO(), user); err != nil {
		return errors.New("Failed to create user")
	}
	user.Id = result.InsertedID.(bson.ObjectID)
	return nil
}
