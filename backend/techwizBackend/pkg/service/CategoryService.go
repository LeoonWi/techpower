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
		Remove(category *models.Category) (int, error)
		Get() *[]models.Category
	}

	CategoryService struct {
		CategoryRepository repository.ICategoryRepository
		ChatRepository     repository.IChatRepository
	}
)

func NewCategoryService(
	categoryRepository repository.ICategoryRepository,
	chatRepository repository.IChatRepository,
) *CategoryService {
	return &CategoryService{
		CategoryRepository: categoryRepository,
		ChatRepository:     chatRepository,
	}
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

	var chat models.Chat
	chat.CategoryId = category.Id
	chat.Name = category.Name
	if err := s.ChatRepository.Create(&chat); err != nil {
		if err := s.CategoryRepository.Remove(*category.Id); err != nil {
			*status = http.StatusBadRequest
			return err
		}
		*status = http.StatusBadRequest
		return err
	}

	*status = http.StatusCreated
	return nil
}

func (s *CategoryService) Get() *[]models.Category {
	var categories []models.Category
	if err := s.CategoryRepository.Get(&categories); err != nil {
		return &[]models.Category{}
	}
	return &categories
}

func (s *CategoryService) Remove(category *models.Category) (int, error) {
	if category.Id != nil {
		if err := s.CategoryRepository.FindById(category.Id, category); err != nil {
			return http.StatusNotFound, err
		}
	}

	if category.Name != "" {
		if err := s.CategoryRepository.FindByName(category.Name, category); err != nil {
			return http.StatusNotFound, err
		}
	}

	if err := s.CategoryRepository.Remove(*category.Id); err != nil {
		return http.StatusBadRequest, err
	}

	if err := s.ChatRepository.RemoveByCategory(*category.Id); err != nil {
		return http.StatusBadRequest, err
	}
	return http.StatusOK, nil
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

	oldName := category.Name
	if oldName == newName {
		*status = http.StatusConflict
		return errors.New("Category name cannot be the same name")
	}

	category.Name = newName
	if err := s.CategoryRepository.Rename(category); err != nil {
		*status = http.StatusBadRequest
		return err
	}

	if err := s.ChatRepository.RenameByCategory(*category.Id, category.Name); err != nil {
		category.Name = oldName
		if err := s.CategoryRepository.Rename(category); err != nil {
		}
		*status = http.StatusBadRequest
		return err
	}
	*status = http.StatusOK
	return nil
}
