package service

import (
	"errors"
	"github.com/dongri/phonenumber"
	"techwizBackend/pkg/models/dao"
	"techwizBackend/pkg/models/dto"
	"techwizBackend/pkg/repository/mongodb"
)

type (
	IAuthService interface {
		CreateUser(value dao.User) (string, error)
		Login(dto *dto.User) error
	}

	AuthService struct {
		AuthRepository mongodb.IAuthRepository
		UserRepository mongodb.IUserRepository
	}
)

func NewAuthService(
	authRepository mongodb.IAuthRepository,
	userRepository mongodb.IUserRepository,
) *AuthService {
	return &AuthService{
		AuthRepository: authRepository,
		UserRepository: userRepository,
	}
}

func (s *AuthService) CreateUser(value dao.User) (string, error) {
	number := phonenumber.Parse(value.PhoneNumber, "ru")
	var res dao.User
	if err := s.UserRepository.GetUserByPhone(number, &res); err == nil {
		return res.Id.Hex(), errors.New("User already exists")
	}
	res.PhoneNumber = number
	return s.AuthRepository.CreateUser(res)
}

func (s *AuthService) Login(dto *dto.User) error {
	number := phonenumber.Parse(dto.PhoneNumber, "ru")
	var res dao.User
	if err := s.UserRepository.GetUserByPhone(number, &res); err != nil {
		return err
	}
	dto.Id = res.Id.Hex()

	if dto.Password != res.Password {
		return errors.New("Password does not match")
	}

	if dto.Permission != res.Permission {
		return errors.New("Permission does not match")
	}
	return nil
}
