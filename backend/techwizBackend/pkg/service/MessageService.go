package service

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
	"time"
)

type (
	IMessageService interface {
		Save(message *models.Message) error
	}

	MessageService struct {
		MessageRepository repository.IMessageRepository
		ChatRepository    repository.IChatRepository
	}
)

func NewMessageService(
	messageRepository repository.IMessageRepository,
	chatRepository repository.IChatRepository,
) *MessageService {
	return &MessageService{
		MessageRepository: messageRepository,
		ChatRepository:    chatRepository,
	}
}

func (s *MessageService) Save(message *models.Message) error {
	message.CreatedAt = time.Now()
	// get chat id for personal chat
	if message.RecipientId != nil {
		var chat models.Chat
		if err := s.ChatRepository.GetChatByMembers(message.SenderId, *message.RecipientId, &chat); err != nil {
			// create chat if he is not exists
			chat = models.Chat{MembersId: []bson.ObjectID{message.SenderId, *message.RecipientId}}
			if err := s.ChatRepository.Create(&chat); err != nil {
				return err
			}
		}
		message.Chat = *chat.Id
	}
	if err := s.MessageRepository.Save(message); err != nil {
		return err
	}

	return nil
}
