package service

import (
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"net/http"
	"techwizBackend/pkg/models/dao"
	"techwizBackend/pkg/models/dto"
	"techwizBackend/pkg/repository"
)

type (
	IUserService interface {
		ChangePassword(input dto.User, statusCode *int) error
	}

	UserService struct {
		UserRepository repository.IUserRepository
	}
)

func NewUserService(userRepository repository.IUserRepository) *UserService {
	return &UserService{UserRepository: userRepository}
}

func (s *UserService) ChangePassword(input dto.User, statusCode *int) error {
	id, _ := bson.ObjectIDFromHex(input.Id)
	var res dao.User
	if err := s.UserRepository.GetUserById(id, &res); err != nil {
		*statusCode = http.StatusNotFound
		return err
	}

	if res.Password == input.Password {
		*statusCode = http.StatusBadRequest
		return errors.New("New password cannot match the past")
	}

	if err := s.UserRepository.ChangePassword(id, input.Password); err != nil {
		*statusCode = http.StatusBadRequest
		return err
	}

	*statusCode = http.StatusOK
	return nil
}
