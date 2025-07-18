package service

import (
	"errors"
	"fmt"
	"github.com/dongri/phonenumber"
	"go.mongodb.org/mongo-driver/v2/bson"
	"log"
	"net/http"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
	"time"
)

type (
	IRequestService interface {
		Create(request *models.Request) (int, error)
		GetRequests() *[]models.Request
		GetRequest(id bson.ObjectID, request *models.Request) (int, error)
		AttachMaster(requestId bson.ObjectID, userId bson.ObjectID, request *models.Request) (int, error)
		UpdateRequest(id bson.ObjectID, request *models.Request) error
		ChangeStatus(requestId bson.ObjectID, status *models.Status) (int, error)
		InSpot(id bson.ObjectID) error
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

	status := models.Status{Code: 1, Reason: ""}
	request.Status = status
	request.CreatedAt = time.Now()

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

func (s RequestService) AttachMaster(requestId bson.ObjectID, userId bson.ObjectID, request *models.Request) (int, error) {
	if err := s.RequestRepository.AttachMaster(requestId, userId, request); err != nil {
		return http.StatusBadRequest, err
	}
	return http.StatusOK, nil
}

func (s RequestService) GetRequest(id bson.ObjectID, request *models.Request) (int, error) {
	if err := s.RequestRepository.GetRequest(id, request); err != nil {
		return http.StatusBadRequest, err
	}
	return http.StatusOK, nil
}

func (s RequestService) UpdateRequest(id bson.ObjectID, update *models.Request) error {
	//if update.FullName == "" && update.PhoneNumber == "" && update.Address == "" &&
	//	update.Problem == "" && update.Price == 0 && update.Status == nil &&
	//	update.Premium == nil && update.CategoryID == nil && update.WorkerID == nil {
	//	return fmt.Errorf("не указаны данные для обновления")
	//}
	log.Println(id, update)
	return nil
}

func (s RequestService) ChangeStatus(requestId bson.ObjectID, status *models.Status) (int, error) {
	if status.Code == 3 || status.Code == 4 {
		status.Reason = ""
		status.PriceIsBail = 0
	} else if status.Code == 5 || status.Code == 6 {
		if status.Reason == "" || status.PriceIsBail == 0 {
			return http.StatusBadRequest, fmt.Errorf("status code %v is not valid reason or price", status.Code)
		}
	} else if status.Code == 7 {
		if status.Reason == "" {
			return http.StatusBadRequest, errors.New("status code 7 is not valid reason")
		}
		status.PriceIsBail = 0
	}

	err := s.RequestRepository.ChangeStatus(requestId, status)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("%s", err.Error())
	}

	return http.StatusOK, nil
}

func (s RequestService) InSpot(id bson.ObjectID) error {
	return s.RequestRepository.InSpot(id)
}
