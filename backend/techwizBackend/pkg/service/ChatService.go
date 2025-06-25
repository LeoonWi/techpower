package service

import (
	"errors"
	"net/http"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
)

type (
	IChatService interface {
		Create(chat *models.Chat) (int, error)
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

func (s *ChatService) Create(chat *models.Chat) (int, error) {
	if chat.Name == "" {
		return http.StatusBadRequest, errors.New("Name is required")
	}
	if len(chat.OwnerId.Hex()) < 24 {
		return http.StatusBadRequest, errors.New("Invalid OwnerId")
	}

	if err := s.ChatRepository.Create(chat); err != nil {
		return http.StatusBadRequest, err
	}
	return http.StatusOK, nil
}
