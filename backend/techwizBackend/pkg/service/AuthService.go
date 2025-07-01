package service

import (
	"errors"
	"github.com/dongri/phonenumber"
	"log"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
)

type (
	IAuthService interface {
		CreateUser(user *models.User) error
		Login(user *models.User) error
	}

	AuthService struct {
		AuthRepository repository.IAuthRepository
		UserRepository repository.IUserRepository
	}
)

func NewAuthService(
	authRepository repository.IAuthRepository,
	userRepository repository.IUserRepository,
) *AuthService {
	return &AuthService{
		AuthRepository: authRepository,
		UserRepository: userRepository,
	}
}

func (s *AuthService) CreateUser(user *models.User) error {
	user.PhoneNumber = phonenumber.Parse(user.PhoneNumber, "ru")
	if err := s.UserRepository.GetUserByPhone(user.PhoneNumber, user); err == nil {
		return errors.New("User already exists")
	}
	if err := s.AuthRepository.CreateUser(user); err != nil {
		return err
	}
	return nil
}

func (s *AuthService) Login(user *models.User) error {
	if len(user.Permission) != 4 {
		return errors.New("Invalid string permission")
	}

	user.PhoneNumber = phonenumber.Parse(user.PhoneNumber, "ru")
	var res models.User
	if err := s.UserRepository.GetUserByPhone(user.PhoneNumber, &res); err != nil {
		return err
	}

	if user.Password != res.Password {
		log.Println(user.Password, res.Password)
		return errors.New("Password does not match")
	}

	if user.Permission != res.Permission {
		log.Println(user.Permission, res.Permission)
		return errors.New("Permission does not match")
	}
	user.Id = res.Id
	return nil
}
