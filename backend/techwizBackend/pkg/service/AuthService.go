package service

import "techwizBackend/pkg/models/user"

type (
	IAuthService interface {
		CreateUser(value user.User) (int, error)
	}

	AuthService struct{}
)

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s AuthService) CreateUser(value user.User) (int, error) {
	return 0, nil
}
