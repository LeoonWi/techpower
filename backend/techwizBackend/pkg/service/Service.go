package service

type (
	// General service
	Service struct {
		Authorization    IAuthService
		UserService      IUserService
		RequestService   IRequestService
		CategoryService  ICategoryService
		ChatService      IChatService
		MessageService   IMessageService
		StatisticService IStatisticService
	}
)

func NewServices(
	authService IAuthService,
	userService IUserService,
	requestService IRequestService,
	categoryService ICategoryService,
	chatService IChatService,
	messageService IMessageService,
	statisticService IStatisticService,
) *Service {
	return &Service{
		Authorization:    authService,
		UserService:      userService,
		RequestService:   requestService,
		CategoryService:  categoryService,
		ChatService:      chatService,
		MessageService:   messageService,
		StatisticService: statisticService,
	}
}
