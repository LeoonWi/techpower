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
		ChangePermission(user *models.User, statusCode *int) error
		ChangePassword(user *models.User, statusCode *int) error
	}

	UserService struct {
		UserRepository repository.IUserRepository
	}
)

func NewUserService(userRepository repository.IUserRepository) *UserService {
	return &UserService{UserRepository: userRepository}
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
