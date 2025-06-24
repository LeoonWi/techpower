package service

import (
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"net/http"
	"techwizBackend/pkg/models/dao"
	"techwizBackend/pkg/models/dto"
	"techwizBackend/pkg/repository"
)

type (
	ICategoryService interface {
		Create(categoryDTO *dto.Category, status *int) error
		Rename(id string, name string, status *int) error
	}

	CategoryService struct {
		CategoryRepository repository.ICategoryRepository
	}
)

func NewCategoryService(categoryRepository repository.ICategoryRepository) *CategoryService {
	return &CategoryService{CategoryRepository: categoryRepository}
}

func (s *CategoryService) Create(categoryDTO *dto.Category, status *int) error {
	var category dao.Category
	if err := s.CategoryRepository.FindByName(categoryDTO.Name, &category); err == nil {
		*status = http.StatusConflict
		return errors.New("Category already exists")
	}

	if err := s.CategoryRepository.Create(&category); err != nil {
		*status = http.StatusBadRequest
		return err
	}

	categoryDTO.Id = category.Id.Hex()
	*status = http.StatusCreated
	return nil
}

func (s *CategoryService) Rename(id string, name string, status *int) error {
	var category dao.Category
	category.Id, _ = bson.ObjectIDFromHex(id)
	if err := s.CategoryRepository.FindById(category.Id, &category); err != nil {
		*status = http.StatusBadRequest
		return err
	}

	if category.Name == name {
		*status = http.StatusConflict
		return errors.New("Category name cannot be the same name")
	}

	category.Name = name
	if err := s.CategoryRepository.Rename(&category); err != nil {
		*status = http.StatusBadRequest
		return err
	}

	*status = http.StatusOK
	return nil
}
