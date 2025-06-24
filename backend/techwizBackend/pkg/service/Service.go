package service

type (
	// General service
	Service struct {
		Authorization   IAuthService
		UserService     IUserService
		RequestService  IRequestService
		CategoryService ICategoryService
	}
)

func NewServices(
	authService IAuthService,
	userService IUserService,
	requestService IRequestService,
	categoryService ICategoryService,
) *Service {
	return &Service{
		Authorization:   authService,
		UserService:     userService,
		RequestService:  requestService,
		CategoryService: categoryService,
	}
}
