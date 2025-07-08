package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	IRequestRepository interface {
		Create(request *models.Request) error
		GetRequests(requests *[]models.Request) error
	}

	RequestRepository struct {
		db *mongo.Client
	}
)

func NewRequestRepository(db *mongo.Client) *RequestRepository {
	return &RequestRepository{db: db}
}

func (r RequestRepository) Create(request *models.Request) error {
	coll := r.db.Database("TechPower").Collection("Requests")
	res, err := coll.InsertOne(context.TODO(), request)
	if err != nil {
		return err
	}

	request.Id = res.InsertedID.(bson.ObjectID)
	return nil
}

func (r RequestRepository) GetRequests(requests *[]models.Request) error {
	coll := r.db.Database("TechPower").Collection("Requests")
	pipeline := mongo.Pipeline{
		// Выполняем $lookup для объединения с коллекцией Category
		bson.D{{
			"$lookup",
			bson.M{
				"from":         "Category",
				"localField":   "category_id",
				"foreignField": "_id",
				"as":           "category",
			},
		}},
		// Разворачиваем массив category
		bson.D{{
			"$unwind", bson.D{
				{"path", "$category"},
				{"preserveNullAndEmptyArrays", true},
			},
		}},
		// Выполняем $lookup для объединения с коллекцией Category
		bson.D{{
			"$lookup",
			bson.M{
				"from":         "Users",
				"localField":   "worker_id",
				"foreignField": "_id",
				"as":           "worker",
			},
		}},
		// Разворачиваем массив worker
		bson.D{{
			"$unwind", bson.D{
				{"path", "$worker"},
				{"preserveNullAndEmptyArrays", true},
			},
		}},
		// Удаляем categories_id из результата
		bson.D{{
			"$unset",
			"category_id",
		}},
		// Удаляем worker_id из результата
		bson.D{{
			"$unset",
			"worker_id",
		}},
	}

	cursor, err := coll.Aggregate(context.TODO(), pipeline)
	defer cursor.Close(context.TODO())
	if err != nil {
		return err
	}

	if err := cursor.All(context.TODO(), requests); err != nil {
		return err
	}
	return nil
}
