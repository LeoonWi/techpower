package service

import (
	"errors"
	"github.com/dongri/phonenumber"
	"log"
	"techwizBackend/pkg/models/user"
	"techwizBackend/pkg/repository"
)

type (
	IAuthService interface {
		CreateUser(value user.User) (string, error)
	}

	AuthService struct {
		AuthRepository repository.IAuthRepository
	}
)

func NewAuthService(authRepository repository.IAuthRepository) *AuthService {
	return &AuthService{AuthRepository: authRepository}
}

func (s AuthService) CreateUser(user user.User) (string, error) {
	number := phonenumber.Parse(user.PhoneNumber, "ru")
	log.Println("Проверка телефона")
	if res, err := s.AuthRepository.GetUserByPhone(number); err == nil {
		return res.Id.Hex(), errors.New("User already exists")
	}
	log.Println("Создание пользователя")
	user.PhoneNumber = number
	return s.AuthRepository.CreateUser(user)
}
