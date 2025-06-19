package service

type (
	// General service
	Service struct {
		Authorization IAuthService
	}
)

func NewServices(authService IAuthService) *Service {
	return &Service{Authorization: authService}
}
