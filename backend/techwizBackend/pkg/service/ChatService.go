package service

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"net/http"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
)

type (
	IChatService interface {
		Create(sender bson.ObjectID, recipient bson.ObjectID, chat *models.Chat) (int, error)
	}

	ChatService struct {
		ChatRepository repository.IChatRepository
		UserRepository repository.IUserRepository
	}
)

func NewChatService(
	charRepository repository.IChatRepository,
	userRepository repository.IUserRepository,
) IChatService {
	return &ChatService{
		ChatRepository: charRepository,
		UserRepository: userRepository,
	}
}

func (s *ChatService) Create(sender bson.ObjectID, recipient bson.ObjectID, chat *models.Chat) (int, error) {
	//if len(sender.Hex()) < 24 || len(recipient.Hex()) < 24 {
	//	return http.StatusBadRequest, errors.New("Invalid id")
	//}
	if err := s.ChatRepository.Create(chat); err != nil {
		return http.StatusBadRequest, err
	}
	return http.StatusOK, nil
}
