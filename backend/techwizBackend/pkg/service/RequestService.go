package service

import (
	"net/http"
	"techwizBackend/pkg/models"
)

type (
	IRequestService interface {
		Create(request *models.Request) (int, error)
	}

	RequestService struct {
	}
)

func NewRequestService() *RequestService {
	return &RequestService{}
}

func (r RequestService) Create(request *models.Request) (int, error) {
	return http.StatusCreated, nil
}
