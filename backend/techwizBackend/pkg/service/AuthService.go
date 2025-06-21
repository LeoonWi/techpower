package service

import (
	"errors"
	"github.com/dongri/phonenumber"
	"techwizBackend/pkg/models/dto/userDTO"
	"techwizBackend/pkg/models/user"
	"techwizBackend/pkg/repository"
)

type (
	IAuthService interface {
		CreateUser(value user.User) (string, error)
		Login(dto *userDTO.User) error
	}

	AuthService struct {
		AuthRepository repository.IAuthRepository
	}
)

func NewAuthService(authRepository repository.IAuthRepository) *AuthService {
	return &AuthService{AuthRepository: authRepository}
}

func (s AuthService) CreateUser(value user.User) (string, error) {
	number := phonenumber.Parse(value.PhoneNumber, "ru")
	var res user.User
	if err := s.AuthRepository.GetUserByPhone(number, &res); err == nil {
		return res.Id.Hex(), errors.New("User already exists")
	}
	res.PhoneNumber = number
	return s.AuthRepository.CreateUser(res)
}

func (s AuthService) Login(dto *userDTO.User) error {
	number := phonenumber.Parse(dto.PhoneNumber, "ru")
	dto.PhoneNumber = number
	var res user.User
	if err := s.AuthRepository.GetUserByPhone(number, &res); err != nil {
		return err
	}

	if dto.Password != res.Password {
		return errors.New("Password does not match")
	}
	return nil
}
