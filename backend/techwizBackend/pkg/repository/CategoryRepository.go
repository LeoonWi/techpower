package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	ICategoryRepository interface {
		Create(*models.Category) error
		FindById(id *bson.ObjectID, category *models.Category) error
		FindByName(name string, category *models.Category) error
		Rename(*models.Category) error
		Remove(id bson.ObjectID) error
	}

	CategoryRepository struct {
		db *mongo.Client
	}
)

func NewCategoryRepository(db *mongo.Client) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r CategoryRepository) Create(category *models.Category) error {
	coll := r.db.Database("TechPower").Collection("Category")
	res, err := coll.InsertOne(context.TODO(), category)
	if err != nil {
		return errors.New("Failed to create category")
	}
	insertedId := res.InsertedID.(bson.ObjectID)
	category.Id = &insertedId
	return nil
}

func (r CategoryRepository) Remove(id bson.ObjectID) error {
	coll := r.db.Database("TechPower").Collection("Category")
	res, err := coll.DeleteOne(context.TODO(), bson.D{{"_id", id}})
	if err != nil {
		return errors.New("Failed to remove category")
	}

	if res.DeletedCount == 0 {
		return errors.New("Failed to remove category")
	}

	return nil
}

func (r CategoryRepository) FindById(id *bson.ObjectID, category *models.Category) error {
	coll := r.db.Database("TechPower").Collection("Category")
	if err := coll.FindOne(context.TODO(), bson.D{{"_id", id}}).Decode(&category); err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("Category not found")
		}
		return err
	}
	return nil
}

func (r CategoryRepository) FindByName(name string, category *models.Category) error {
	coll := r.db.Database("TechPower").Collection("Category")
	filter := bson.D{{"name", name}}
	if err := coll.FindOne(context.TODO(), filter).Decode(&category); err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("Category not found")
		}
		return err
	}
	return nil
}

func (r CategoryRepository) Rename(category *models.Category) error {
	coll := r.db.Database("TechPower").Collection("Category")
	filter := bson.M{"_id": category.Id}
	update := bson.M{"$set": bson.D{{"name", category.Name}}}
	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed to rename category")
	}
	return nil
}
