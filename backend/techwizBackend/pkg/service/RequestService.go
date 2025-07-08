package service

import (
	"github.com/dongri/phonenumber"
	"net/http"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
)

type (
	IRequestService interface {
		Create(request *models.Request) (int, error)
		GetRequests() *[]models.Request
	}

	RequestService struct {
		RequestRepository repository.IRequestRepository
	}
)

func NewRequestService(requestRepository repository.IRequestRepository) *RequestService {
	return &RequestService{
		RequestRepository: requestRepository,
	}
}

func (s RequestService) Create(request *models.Request) (int, error) {
	request.PhoneNumber = phonenumber.Parse(request.PhoneNumber, "ru")

	status := models.Status{StatusCode: 1, Reason: ""}
	request.Status = status

	if err := s.RequestRepository.Create(request); err != nil {
		return http.StatusBadRequest, err
	}
	return http.StatusCreated, nil
}

func (s RequestService) GetRequests() *[]models.Request {
	var requests []models.Request
	if err := s.RequestRepository.GetRequests(&requests); err != nil {
		return &[]models.Request{}
	}
	return &requests
}
