package service

import (
	"fmt"
	"net/http"
	"sync"
	"techwizBackend/pkg/models"
	"time"
)

type (
	IRequestService interface {
		Create(request *models.Request) (int, error)
		GetAll() ([]models.Request, error)
		GetByID(id string) (*models.Request, error)
		Update(id string, req *models.Request) error
		Delete(id string) error
	}

	RequestService struct {
		mu      sync.Mutex
		orders  []models.Request
	}
)

func NewRequestService() *RequestService {
	return &RequestService{
		orders: make([]models.Request, 0),
	}
}

func (r *RequestService) Create(request *models.Request) (int, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	request.ID = generateID() // функция для генерации уникального ID
	r.orders = append(r.orders, *request)
	return http.StatusCreated, nil
}

func (r *RequestService) GetAll() ([]models.Request, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	return append([]models.Request(nil), r.orders...), nil
}

func (r *RequestService) GetByID(id string) (*models.Request, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, order := range r.orders {
		if order.ID == id {
			return &order, nil
		}
	}
	return nil, http.ErrMissingFile
}

func (r *RequestService) Update(id string, req *models.Request) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	for i, order := range r.orders {
		if order.ID == id {
			req.ID = id
			r.orders[i] = *req
			return nil
		}
	}
	return http.ErrMissingFile
}

func (r *RequestService) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	for i, order := range r.orders {
		if order.ID == id {
			r.orders = append(r.orders[:i], r.orders[i+1:]...)
			return nil
		}
	}
	return http.ErrMissingFile
}

// generateID генерирует уникальный ID (можно заменить на UUID при необходимости)
func generateID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
