package repository

import (
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	IChatRepository interface {
		Create(chat *models.Chat) error
	}

	ChatRepository struct {
		db *mongo.Client
	}
)

func NewChatRepository(db *mongo.Client) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r ChatRepository) Create(chat *models.Chat) error {

	return nil
}
