package repository

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	IRequestRepository interface {
		Create(request *models.Request) error
		GetRequests(requests *[]models.Request) error
		GetRequest(id bson.ObjectID, request *models.Request) error
		AttachMaster(requestId bson.ObjectID, userId bson.ObjectID, request *models.Request) error
		ChangeStatus(id bson.ObjectID, status *models.Request) error
		InSpot(id bson.ObjectID) error
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
	if err != nil {
		return err
	}
	defer cursor.Close(context.TODO())

	if err := cursor.All(context.TODO(), requests); err != nil {
		return err
	}
	return nil
}

func (r RequestRepository) GetRequest(id bson.ObjectID, request *models.Request) error {
	coll := r.db.Database("TechPower").Collection("Requests")
	pipeline := mongo.Pipeline{
		bson.D{{"$match", bson.M{"_id": id}}},
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
		// Удаляем categories_id и worker_id из результата
		{
			{"$project", bson.D{
				{"category_id", 0},
				{"worker_id", 0},
			}},
		},
	}

	cursor, err := coll.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return fmt.Errorf("%s", err.Error())
	}
	defer cursor.Close(context.TODO())

	if cursor.Next(context.TODO()) {
		if err := cursor.Decode(request); err != nil {
			return fmt.Errorf("%s", err.Error())
		}
		return nil
	}
	return fmt.Errorf("Request not found")
}

func (r RequestRepository) AttachMaster(requestId bson.ObjectID, userId bson.ObjectID, request *models.Request) error {
	coll := r.db.Database("TechPower").Collection("Requests")
	filter := bson.M{"_id": requestId}
	update := bson.M{"$set": bson.M{"worker_id": userId, "status.code": 2}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return err
	}

	if err := r.GetRequest(requestId, request); err != nil {
		return err
	}

	return nil
}

func (r RequestRepository) ChangeStatus(id bson.ObjectID, status *models.Request) error {
	coll := r.db.Database("TechPower").Collection("Requests")
	filter := bson.M{"_id": id}
	if status.Status.Code == 0 && status.Status.Reason == "" && status.Status.PriceIsBail == 0 && !status.Status.InSpot {
    return fmt.Errorf("status is empty or invalid")
}
	update := bson.M{"$set": bson.M{"status": status.Status}}
	if status.Status.Code == 4 && status.Price >= 0 {
		update = bson.M{"$set": bson.M{"price": status.Price, "status": status.Status}}
	}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return fmt.Errorf("%s", err.Error())
	}

	return nil
}

func (r RequestRepository) InSpot(id bson.ObjectID) error {
	coll := r.db.Database("TechPower").Collection("Requests")
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"in_spot": true}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return err
	}

	return nil
}
