package service

import (
	"net/http"
	"techwizBackend/pkg/models/dao"
	"techwizBackend/pkg/models/dto"
)

type (
	IRequestService interface {
		Create(val *dto.Request, status *int) error
	}

	RequestService struct {
	}
)

func NewRequestService() *RequestService {
	return &RequestService{}
}

func (service *RequestService) Create(val *dto.Request, status *int) error {
	var request dao.Request
	request.Name = val.Name
	request.PhoneNumber = val.PhoneNumber
	request.Address = val.Address
	request.Comment = val.Comment
	request.Price = val.Price
	// TODO отложка
	*status = http.StatusOK
	return nil
}
