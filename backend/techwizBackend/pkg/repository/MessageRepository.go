package repository

import (
	"context"
	"errors"
	"techwizBackend/pkg/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type (
	IMessageRepository interface {
		Save(*models.Message) error
		GetMessageByChat(chat_id bson.ObjectID, messages *[]models.Message) error
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

func (r MessageRepository) GetMessageByChat(chat_id bson.ObjectID, messages *[]models.Message) error {
	coll := r.db.Database("TechPower").Collection("Messages")
	filter := bson.M{"chat_id": chat_id}
	opts := options.Find().SetSort(bson.D{{"created_at", 1}})

	cursor, err := coll.Find(context.TODO(), filter, opts)
	if err != nil {
		return errors.New("Failed to query messages: " + err.Error())
	}

	if err = cursor.All(context.TODO(), messages); err != nil {
		return errors.New("Failed to decode messages: " + err.Error())
	}

	defer cursor.Close(context.TODO())
	return nil
}
