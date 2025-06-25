package repository

import "go.mongodb.org/mongo-driver/v2/mongo"

type (
	IMessageRepository interface{}

	MessageRepository struct {
		db *mongo.Client
	}
)

func NewMessageRepository(client *mongo.Client) *MessageRepository {
	return &MessageRepository{
		db: client,
	}
}
