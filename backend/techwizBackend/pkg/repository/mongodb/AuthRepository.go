package mongodb

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"log"
	"techwizBackend/pkg/models/dao"
)

type (
	IAuthRepository interface {
		CreateUser(val dao.User) (string, error)
	}
	AuthRepository struct {
		db *mongo.Client
	}
)

func NewAuthRepository(db *mongo.Client) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) CreateUser(val dao.User) (string, error) {
	coll := r.db.Database("TechPower").Collection("Users")
	var result *mongo.InsertOneResult
	var err error
	if result, err = coll.InsertOne(context.TODO(), val); err != nil {
		log.Println(err)
		return "-1", errors.New("Failed to create user")
	}
	return result.InsertedID.(bson.ObjectID).Hex(), nil
}
