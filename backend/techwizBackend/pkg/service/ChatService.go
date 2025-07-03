package service

import (
	"errors"
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
		GetChats(userId bson.ObjectID) *[]models.Chat
		AddUser(idUser bson.ObjectID, idChat bson.ObjectID) error
		RemoveUser(idUser bson.ObjectID, idChat bson.ObjectID) error
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

func (s ChatService) Create(chat *models.Chat) (int, error) {
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

func (s ChatService) GetChats(userId bson.ObjectID) *[]models.Chat {
	var chats []models.Chat
	if err := s.ChatRepository.GetChats(userId, &chats); err != nil {
		return &[]models.Chat{}
	}
	return &chats
}

func (s ChatService) AddUser(idUser bson.ObjectID, idChat bson.ObjectID) error {
	var chat models.Chat
	if err := s.ChatRepository.GetChatById(idChat, &chat); err != nil {
		return err
	}

	for _, member := range chat.MembersId {
		if member == idUser {
			return errors.New("User already in chat")
		}
	}

	if err := s.ChatRepository.AddUser(idUser, idChat); err != nil {
		return err
	}

	return nil
}

func (s ChatService) RemoveUser(idUser bson.ObjectID, idChat bson.ObjectID) error {
	if err := s.ChatRepository.RemoveUser(idUser, idChat); err != nil {
		return err
	}

	return nil
}
