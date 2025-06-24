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
		GetUser(id string, userDTO *dto.User, statusCode *int) error
		ChangePassword(input dto.User, statusCode *int) error
	}

	UserService struct {
		UserRepository repository.IUserRepository
	}
)

func NewUserService(userRepository repository.IUserRepository) *UserService {
	return &UserService{UserRepository: userRepository}
}

func (s UserService) GetUser(id string, userDTO *dto.User, statusCode *int) error {
	objectId, _ := bson.ObjectIDFromHex(id)
	var userDAO dao.User
	if err := s.UserRepository.GetUserById(objectId, &userDAO); err != nil {
		*statusCode = http.StatusNotFound
		return err
	}

	userDTO.Id = userDAO.Id.Hex()
	userDTO.PhoneNumber = userDAO.PhoneNumber
	userDTO.FullName = userDAO.FullName
	userDTO.Permission = userDAO.Permission
	userDTO.Photo = userDAO.Photo
	userDTO.Nickname = userDAO.Nickname
	//userDTO.Category = userDAO.Category
	userDTO.Status = userDAO.Status
	userDTO.Balance = userDAO.Balance
	userDTO.Commission = userDAO.Commission
	*statusCode = http.StatusOK
	return nil
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
