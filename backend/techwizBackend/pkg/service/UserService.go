package service

import (
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"net/http"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
)

type (
	IUserService interface {
		GetUser(id string, user *models.User, statusCode *int) error
		GetUsers() *[]models.User
		ChangePassword(user *models.User, statusCode *int) error
		ChangePermission(user *models.User, statusCode *int) error
		AddCategory(idUser bson.ObjectID, idCategory bson.ObjectID) (int, error)
		RemoveCategory(idUser bson.ObjectID, idCategory bson.ObjectID) (int, error)
	}

	UserService struct {
		UserRepository repository.IUserRepository
		ChatRepository repository.IChatRepository
	}
)

func NewUserService(
	userRepository repository.IUserRepository,
	chatRepository repository.IChatRepository,
) *UserService {
	return &UserService{
		UserRepository: userRepository,
		ChatRepository: chatRepository,
	}
}

func (s UserService) GetUser(id string, user *models.User, statusCode *int) error {
	objectId, _ := bson.ObjectIDFromHex(id)
	if err := s.UserRepository.GetUserById(objectId, user); err != nil {
		*statusCode = http.StatusNotFound
		return err
	}

	*statusCode = http.StatusOK
	return nil
}

func (s *UserService) ChangePassword(user *models.User, statusCode *int) error {
	var res models.User
	if err := s.UserRepository.GetUserById(user.Id, &res); err != nil {
		*statusCode = http.StatusNotFound
		return err
	}

	if res.Password == user.Password {
		*statusCode = http.StatusBadRequest
		return errors.New("New password cannot match the past")
	}

	if err := s.UserRepository.ChangePassword(user.Id, user.Password); err != nil {
		*statusCode = http.StatusBadRequest
		return err
	}

	*statusCode = http.StatusOK
	return nil
}

func (s *UserService) ChangePermission(user *models.User, statusCode *int) error {
	if len(user.Id.Hex()) < 24 {
		*statusCode = http.StatusBadRequest
		return errors.New("Invalid User Id")
	}

	if len(user.Permission) < 4 {
		*statusCode = http.StatusBadRequest
		return errors.New("Invalid User Permission")
	}

	var res models.User
	if err := s.UserRepository.GetUserById(user.Id, &res); err != nil {
		*statusCode = http.StatusNotFound
		return err
	}

	if res.Permission == user.Permission {
		*statusCode = http.StatusBadRequest
		return errors.New("New permission cannot match the past")
	}

	if err := s.UserRepository.ChangePermission(user.Id, user.Permission); err != nil {
		*statusCode = http.StatusBadRequest
		return err
	}

	*statusCode = http.StatusOK
	return nil
}

func (s *UserService) GetUsers() *[]models.User {
	var users []models.User
	if err := s.UserRepository.GetUsers(&users); err != nil {
		return &[]models.User{}
	}
	return &users
}

func (s *UserService) AddCategory(idUser bson.ObjectID, idCategory bson.ObjectID) (int, error) {
	var user models.User
	if err := s.UserRepository.GetUserById(idUser, &user); err != nil {
		return http.StatusInternalServerError, err
	}

	for _, category := range user.CategoryId {
		if category == idCategory {
			return http.StatusBadRequest, errors.New("Category already exists")
		}
	}

	if err := s.UserRepository.AddCategory(idUser, idCategory); err != nil {
		return http.StatusInternalServerError, err
	}

	var chat models.Chat
	if err := s.ChatRepository.GetChatByCategory(idCategory, &chat); err != nil {
		return http.StatusInternalServerError, err
	}

	if err := s.ChatRepository.AddUser(idUser, *chat.Id); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (s *UserService) RemoveCategory(idUser bson.ObjectID, idCategory bson.ObjectID) (int, error) {
	if err := s.UserRepository.RemoveCategory(idUser, idCategory); err != nil {
		return http.StatusInternalServerError, err
	}

	var chat models.Chat
	if err := s.ChatRepository.GetChatByCategory(idCategory, &chat); err != nil {
		return http.StatusInternalServerError, err
	}

	if err := s.ChatRepository.RemoveUser(idUser, *chat.Id); err != nil {
		return http.StatusInternalServerError, err
	}
	return http.StatusOK, nil
}
