package service

import (
	"net/http"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type (
	IMessageService interface {
		Save(message *models.Message) error
		GetMessageByChat(chat_id bson.ObjectID) (int, *[]models.Message)
	}

	MessageService struct {
		MessageRepository repository.IMessageRepository
		ChatRepository    repository.IChatRepository
		UserRepository    repository.IUserRepository
	}
)

func NewMessageService(
	messageRepository repository.IMessageRepository,
	chatRepository repository.IChatRepository,
	userRepository repository.IUserRepository,
) *MessageService {
	return &MessageService{
		MessageRepository: messageRepository,
		ChatRepository:    chatRepository,
		UserRepository:    userRepository,
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
	} else {
		var user models.User
		if err := s.UserRepository.GetUserById(message.SenderId, &user); err != nil {
			return err
		}
		message.SenderFullName = user.FullName
	}
	if err := s.MessageRepository.Save(message); err != nil {
		return err
	}

	return nil
}

func (s *MessageService) GetMessageByChat(chat_id bson.ObjectID) (int, *[]models.Message) {
	var messages []models.Message
	if err := s.MessageRepository.GetMessageByChat(chat_id, &messages); err != nil {
		return http.StatusBadRequest, nil
	}

	return http.StatusOK, &messages
}
