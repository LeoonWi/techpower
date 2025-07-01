package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	IMessageRepository interface {
		Save(*models.Message) error
	}

	MessageRepository struct {
		db *mongo.Client
	}
)

func NewMessageRepository(client *mongo.Client) *MessageRepository {
	return &MessageRepository{
		db: client,
	}
}

func (r MessageRepository) Save(message *models.Message) error {
	coll := r.db.Database("TechPower").Collection("Messages")
	res, err := coll.InsertOne(context.TODO(), message)
	if err != nil {
		return errors.New("Failed to save message")
	}
	message.Id = res.InsertedID.(bson.ObjectID)
	return nil
}
