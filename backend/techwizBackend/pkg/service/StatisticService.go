package service

import (
	"log"
	"net/http"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
)

type (
	IStatisticService interface {
		Get() (int, *models.Statistics)
	}

	StatisticService struct {
		StatisticRepository repository.IStatisticRepository
	}
)

func NewStatisticService(statisticRepository *repository.StatisticRepository) *StatisticService {
	return &StatisticService{StatisticRepository: statisticRepository}
}

func (s StatisticService) Get() (int, *models.Statistics) {
	result, err := s.StatisticRepository.Get()
	if err != nil {
		log.Println(err.Error())
		return http.StatusInternalServerError, nil
	}
	return http.StatusOK, result
}
