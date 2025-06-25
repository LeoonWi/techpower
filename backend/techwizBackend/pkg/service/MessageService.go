package service

import (
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
)

type (
	IMessageService interface {
		Save(message models.Message) ([]bson.ObjectID, error)
	}

	MessageService struct {
		MessageRepository repository.IMessageRepository
	}
)

func NewMessageService(messageRepository repository.IMessageRepository) *MessageService {
	return &MessageService{
		MessageRepository: messageRepository,
	}
}

func (s *MessageService) Save(message models.Message) ([]bson.ObjectID, error) {
	if len(message.SenderId.Hex()) < 24 || (len(message.RecipientId.Hex()) < 24 && len(message.Chat.Hex()) < 24) {
		return nil, errors.New("SenderId or RecipientId or ChatId is invalid")
	}

	return nil, nil
}
