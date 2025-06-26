package service

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"net/http"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
)

type (
	IChatService interface {
		Create(chat *models.Chat) (int, error)
		GetRecipient(message *models.Message) []bson.ObjectID
		GetChatByMember(member1, member2 bson.ObjectID) *models.Chat
	}

	ChatService struct {
		ChatRepository repository.IChatRepository
		UserRepository repository.IUserRepository
	}
)

func NewChatService(
	chatRepository repository.IChatRepository,
	userRepository repository.IUserRepository,
) IChatService {
	return &ChatService{
		ChatRepository: chatRepository,
		UserRepository: userRepository,
	}
}

func (s *ChatService) Create(chat *models.Chat) (int, error) {

	if err := s.ChatRepository.Create(chat); err != nil {
		return http.StatusBadRequest, err
	}
	return http.StatusOK, nil
}

func (s ChatService) GetRecipient(message *models.Message) []bson.ObjectID {
	return s.ChatRepository.GetRecipient(message)
}

func (s ChatService) GetChatByMember(member1, member2 bson.ObjectID) *models.Chat {
	var chat models.Chat
	if err := s.ChatRepository.GetChatByMembers(member1, member2, &chat); err != nil {
		return nil
	}
	return &chat
}
