package service

type (
	// General service
	Service struct {
		Authorization IAuthService
		UserService   IUserService
	}
)

func NewServices(
	authService IAuthService,
	userService IUserService,
) *Service {
	return &Service{
		Authorization: authService,
		UserService:   userService,
	}
}
