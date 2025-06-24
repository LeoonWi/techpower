package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models/dao"
)

type (
	ICategoryRepository interface {
		Create(*dao.Category) error
		FindById(id bson.ObjectID, category *dao.Category) error
		FindByName(name string, category *dao.Category) error
		Rename(*dao.Category) error
	}

	CategoryRepository struct {
		db *mongo.Client
	}
)

func NewCategoryRepository(db *mongo.Client) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(category *dao.Category) error {
	coll := r.db.Database("TechPower").Collection("Category")
	res, err := coll.InsertOne(context.TODO(), category)
	if err != nil {
		return errors.New("Failed to create category")
	}
	category.Id = res.InsertedID.(bson.ObjectID)
	return nil
}

func (r *CategoryRepository) FindById(id bson.ObjectID, category *dao.Category) error {
	coll := r.db.Database("TechPower").Collection("Category")
	if err := coll.FindOne(context.TODO(), bson.D{{"_id", id}}).Decode(&category); err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("Category not found")
		}
		return err
	}
	return nil
}

func (r *CategoryRepository) FindByName(name string, category *dao.Category) error {
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

func (r CategoryRepository) Rename(category *dao.Category) error {
	coll := r.db.Database("TechPower").Collection("Category")
	filter := bson.M{"_id": category.Id}
	update := bson.M{"$set": bson.D{{"name", category.Name}}}
	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed to rename category")
	}
	return nil
}
