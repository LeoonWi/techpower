package service

import (
	"errors"
	"net/http"
	"techwizBackend/pkg/models"
	"techwizBackend/pkg/repository"
)

type (
	ICategoryService interface {
		Create(category *models.Category, status *int) error
		Rename(category *models.Category, status *int) error
	}

	CategoryService struct {
		CategoryRepository repository.ICategoryRepository
	}
)

func NewCategoryService(categoryRepository repository.ICategoryRepository) *CategoryService {
	return &CategoryService{CategoryRepository: categoryRepository}
}

func (s *CategoryService) Create(category *models.Category, status *int) error {
	if err := s.CategoryRepository.FindByName(category.Name, category); err == nil {
		*status = http.StatusConflict
		return errors.New("Category already exists")
	}

	if err := s.CategoryRepository.Create(category); err != nil {
		*status = http.StatusBadRequest
		return err
	}

	*status = http.StatusCreated
	return nil
}

func (s *CategoryService) Rename(category *models.Category, status *int) error {
	if category.Id.IsZero() || category.Name == "" {
		*status = http.StatusBadRequest
		return errors.New("Category Id or Name is empty")
	}

	newName := category.Name
	if err := s.CategoryRepository.FindById(category.Id, category); err != nil {
		*status = http.StatusBadRequest
		return err
	}

	if category.Name == newName {
		*status = http.StatusConflict
		return errors.New("Category name cannot be the same name")
	}

	category.Name = newName
	if err := s.CategoryRepository.Rename(category); err != nil {
		*status = http.StatusBadRequest
		return err
	}

	*status = http.StatusOK
	return nil
}
