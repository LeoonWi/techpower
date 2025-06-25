package service

import (
	"net/http"
	"techwizBackend/pkg/models"
)

type (
	IRequestService interface {
		Create(val *models.Request, status *int) error
	}

	RequestService struct {
	}
)

func NewRequestService() *RequestService {
	return &RequestService{}
}

func (service *RequestService) Create(val *models.Request, status *int) error {
	var request models.Request
	request.Name = val.Name
	request.PhoneNumber = val.PhoneNumber
	request.Address = val.Address
	request.Comment = val.Comment
	request.Price = val.Price
	// TODO отложка
	*status = http.StatusOK
	return nil
}
