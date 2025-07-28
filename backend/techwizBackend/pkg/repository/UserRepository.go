package repository

import (
	"context"
	"errors"
	"fmt"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	IUserRepository interface {
		GetUserByPhone(phone string, res *models.User) error
		GetUserById(id bson.ObjectID, res *models.User) error
		ChangePassword(id bson.ObjectID, password string) error
		ChangePermission(id bson.ObjectID, permission string) error
		GetUsers(*[]models.User) error
		GetMasters(*[]models.User) error
		AddCategory(idUser bson.ObjectID, idCategory bson.ObjectID) error
		RemoveCategory(idUser bson.ObjectID, idCategory bson.ObjectID) error
		ChangeStatus(id bson.ObjectID, status string) error
		RemoveStatus(id bson.ObjectID) error
		DismissUserById(id bson.ObjectID) error
		UpdateUser(idUser bson.ObjectID, user *models.User) error
	}

	UserRepository struct {
		db *mongo.Client
	}
)

func NewUserRepository(db *mongo.Client) *UserRepository {
	return &UserRepository{db: db}
}

func (r UserRepository) GetUserByPhone(phone string, res *models.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	// Определяем агрегационный пайплайн
	pipeline := mongo.Pipeline{
		// Фильтруем по phone_number
		bson.D{{
			"$match",
			bson.M{"phone_number": phone},
		}},
		// Выполняем $lookup для объединения с коллекцией Category
		bson.D{{
			"$lookup",
			bson.M{
				"from":         "Category",
				"localField":   "categories_id",
				"foreignField": "_id",
				"as":           "categories",
			},
		}},
		// Убедимся, что categories будет пустым массивом, если categories_id пуст
		bson.D{{
			"$set",
			bson.M{
				"categories": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$categories_id", nil}},
						"then": []interface{}{},
						"else": "$categories",
					},
				},
			},
		}},
		// Удаляем categories_id из результата
		bson.D{{
			"$unset",
			"categories_id",
		}},
	}

	// Выполняем агрегацию
	cursor, err := coll.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return fmt.Errorf("failed to find user by phone: %w", err)
	}
	defer cursor.Close(context.TODO())

	// Проверяем, есть ли результат
	if !cursor.Next(context.TODO()) {
		return errors.New("user not found")
	}

	// Декодируем единственный документ
	if err := cursor.Decode(res); err != nil {
		return fmt.Errorf("failed to decode user: %w", err)
	}

	// Проверяем, нет ли дополнительных документов
	if cursor.Next(context.TODO()) {
		return errors.New("multiple users found")
	}

	return nil
}

func (r UserRepository) GetUserById(id bson.ObjectID, res *models.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	// Определяем агрегационный пайплайн
	pipeline := mongo.Pipeline{
		// Фильтруем по _id
		bson.D{{
			"$match",
			bson.M{"_id": id},
		}},
		// Выполняем $lookup для объединения с коллекцией Category
		bson.D{{
			"$lookup",
			bson.M{
				"from":         "Category",
				"localField":   "categories_id",
				"foreignField": "_id",
				"as":           "categories",
			},
		}},
		// Убедимся, что categories будет пустым массивом, если categories_id пуст
		bson.D{{
			"$set",
			bson.M{
				"categories": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$categories_id", nil}},
						"then": []interface{}{},
						"else": "$categories",
					},
				},
			},
		}},
		// Удаляем categories_id из результата
		bson.D{{
			"$unset",
			"categories_id",
		}},
	}

	// Выполняем агрегацию
	cursor, err := coll.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return fmt.Errorf("failed to find user by ID: %s", err.Error())
	}
	defer cursor.Close(context.TODO())

	// Проверяем, есть ли результат
	if !cursor.Next(context.TODO()) {
		return errors.New("user not found")
	}

	// Декодируем единственный документ
	if err := cursor.Decode(res); err != nil {
		return fmt.Errorf("failed to decode user: %w", err)
	}

	// Проверяем, нет ли дополнительных документов
	if cursor.Next(context.TODO()) {
		return errors.New("multiple users found")
	}

	return nil
}

func (r UserRepository) ChangePassword(id bson.ObjectID, password string) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filter := bson.D{{"_id", id}}
	update := bson.D{{"$set", bson.D{{"password", password}}}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed update user password")
	}
	return nil
}

func (r UserRepository) ChangePermission(id bson.ObjectID, permission string) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filter := bson.D{{"_id", id}}
	update := bson.D{{"$set", bson.D{{"permission", permission}}}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed update user permission")
	}

	return nil
}

func (r UserRepository) GetUsers(users *[]models.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	// Определяем агрегационный пайплайн
	pipeline := mongo.Pipeline{
		// Выполняем $lookup для объединения с коллекцией Category
		bson.D{{
			"$lookup",
			bson.M{
				"from":         "Category",
				"localField":   "categories_id",
				"foreignField": "_id",
				"as":           "categories",
			},
		}},
		// Убедимся, что categories будет пустым массивом, если categories_id пуст
		bson.D{{
			"$set",
			bson.M{
				"categories": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$categories_id", nil}},
						"then": []interface{}{},
						"else": "$categories",
					},
				},
			},
		}},
		// Удаляем categories_id из результата
		bson.D{{
			"$unset",
			"categories_id",
		}},
	}

	// Выполняем агрегацию
	cursor, err := coll.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return fmt.Errorf("failed to find users: %w", err)
	}
	defer cursor.Close(context.TODO())

	if err = cursor.All(context.TODO(), users); err != nil {
		return errors.New("Failed to get users")
	}

	return nil
}

func (r UserRepository) GetMasters(users *[]models.User) error {
	coll := r.db.Database("TechPower").Collection("Users")
	// Определяем агрегационный пайплайн
	pipeline := mongo.Pipeline{
		// Фильтруем документы, у которых есть поле status
		bson.D{{
			"$match",
			bson.M{
				"status": bson.M{"$exists": true},
			},
		}},
		// Выполняем $lookup для объединения с коллекцией Category
		bson.D{{
			"$lookup",
			bson.M{
				"from":         "Category",
				"localField":   "categories_id",
				"foreignField": "_id",
				"as":           "categories",
			},
		}},
		// Убедимся, что categories будет пустым массивом, если categories_id пуст
		bson.D{{
			"$set",
			bson.M{
				"categories": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$categories_id", nil}},
						"then": []interface{}{},
						"else": "$categories",
					},
				},
			},
		}},
		// Удаляем categories_id из результата
		bson.D{{
			"$unset",
			"categories_id",
		}},
	}

	// Выполняем агрегацию
	cursor, err := coll.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return fmt.Errorf("failed to find users: %w", err)
	}
	defer cursor.Close(context.TODO())

	if err = cursor.All(context.TODO(), users); err != nil {
		return errors.New("Failed to get users")
	}

	return nil
}

func (r UserRepository) AddCategory(idUser bson.ObjectID, idCategory bson.ObjectID) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filter := bson.D{{"_id", idUser}}
	update := bson.M{"$push": bson.M{"categories_id": idCategory}}

	var user models.User
	if err := r.GetUserById(idUser, &user); err != nil {
		return errors.New("User not found")
	}

	for _, category := range user.CategoryId {
		if category == idCategory {
			return errors.New(fmt.Sprintf("User already contains category %s", idCategory.Hex()))
		}
	}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed to add user categories")
	}
	return nil
}

func (r UserRepository) RemoveCategory(idUser bson.ObjectID, idCategory bson.ObjectID) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filter := bson.D{{"_id", idUser}}
	update := bson.M{"$pull": bson.M{"categories_id": idCategory}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed to remove user categories")
	}
	return nil
}

func (r UserRepository) ChangeStatus(id bson.ObjectID, status string) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filter := bson.D{{"_id", id}}
	var commissions float64
	if status == "senior" {
		commissions = 0.4
	} else {
		commissions = 0.45
	}
	update := bson.D{{"$set", bson.D{{"status", status}, {"commission", commissions}}}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed to change status of master")
	}

	return nil
}

func (r UserRepository) RemoveStatus(id bson.ObjectID) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filter := bson.D{{"_id", id}}
	update := bson.D{{"$set", bson.D{{"status", "default"}, {"commission", 0.6}}}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed to change status of master")
	}

	return nil
}

func (r UserRepository) DismissUserById(id bson.ObjectID) error {
	coll := r.db.Database("TechPower").Collection("Users")
	filter := bson.D{{"_id", id}}
	update := bson.D{{"$set", bson.D{{"dismissed", true}}}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed to dismiss user")
	}

	return nil
}

func (r UserRepository) UpdateUser(idUser bson.ObjectID, user *models.User) error {
	update := bson.M{"$set": bson.M{}}
	if user.Nickname != "" {
		update["$set"].(bson.M)["nickname"] = user.Nickname
	}
	if user.PhoneNumber != "" {
		update["$set"].(bson.M)["phone_number"] = user.PhoneNumber
	}

	collection := r.db.Database("TechPower").Collection("Users")
	_, err := collection.UpdateOne(
		context.TODO(),
		bson.M{"_id": idUser},
		update,
	)
	if err != nil {
		return errors.New("Failed to update user")
	}

	return nil

}
