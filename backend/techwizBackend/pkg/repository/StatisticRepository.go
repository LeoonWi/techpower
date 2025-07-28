package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	IStatisticRepository interface {
		Get() (*models.Statistics, error)
	}

	StatisticRepository struct {
		db *mongo.Client
	}
)

func NewStatisticRepository(db *mongo.Client) *StatisticRepository {
	return &StatisticRepository{db: db}
}

func (r StatisticRepository) Get() (*models.Statistics, error) {
	// Получаем коллекции
	requestsCollection := r.db.Database("TechPower").Collection("Requests")
	usersCollection := r.db.Database("TechPower").Collection("Users")

	// Агрегационный пайплайн для запросов
	pipeline := bson.A{
		// Выполняем lookup для получения данных о категории
		bson.D{{
			"$lookup",
			bson.D{
				{"from", "Category"},
				{"localField", "category_id"},
				{"foreignField", "_id"},
				{"as", "category_data"},
			},
		}},
		// Разворачиваем массив category_data
		bson.D{{
			"$unwind",
			bson.D{{
				"path", "$category_data"},
				{"preserveNullAndEmptyArrays", true},
			}},
		},
		// Разделяем на фасеты
		bson.D{{
			"$facet",
			bson.D{
				{
					"total_orders",
					bson.A{
						bson.D{{"$count", "count"}},
					},
				},
				{
					"total_commissions",
					bson.A{
						bson.D{{"$match", bson.D{{"status.code", 4}}}}, // только завершённые заказы
						bson.D{{
							"$project", bson.D{
								{"commission", bson.D{
									{"$multiply", bson.A{
										"$price",
										"$commission", // ← теперь берём комиссию напрямую из заказа
									}},
								}},
							},
						}},
						bson.D{{
							"$group", bson.D{
								{"_id", nil},
								{"total", bson.D{{"$sum", "$commission"}}},
							},
						}},
					},
				},
				{
					"completed_orders",
					bson.A{
						bson.D{{
							"$match",
							bson.D{{
								"status.code",
								bson.D{{"$eq", 4}}, // <-- Исправлено с 200 на 4
							}},
						}},
						bson.D{{"$count", "count"}},
					},
				},
				{
					"total_revenue",
					bson.A{
						bson.D{{
							"$match",
							bson.D{{
								"status.code",
								bson.D{{"$eq", 4}}, // <-- Исправлено с 200 на 4
							}},
						}},
						bson.D{{
							"$group",
							bson.D{
								{"_id", nil},
								{"total", bson.D{{"$sum", "$price"}}},
							},
						}},
					},
				},
				{
					"orders_by_city",
					bson.A{
						bson.D{{
							"$addFields",
							bson.D{{
								"city",
								bson.D{{
									"$arrayElemAt",
									bson.A{
										bson.D{{"$split", bson.A{"$address", ","}}},
										0,
									},
								}},
							}},
						}},
						bson.D{{
							"$group",
							bson.D{
								{"_id", bson.D{{
									"$trim",
									bson.D{
										{"input", "$city"},
										{"chars", "г."},
									},
								}}},
								{"count", bson.D{{"$sum", 1}}},
							},
						}},
					},
				},
				{
					"orders_by_category",
					bson.A{
						// Добавляем фильтрацию, чтобы убрать заказы без категории
						bson.D{{
							"$match",
							bson.D{{
								"category_data.name",
								bson.D{{"$ne", nil}},
							}},
						}},
						bson.D{{
							"$group",
							bson.D{
								{"_id", "$category_data.name"},
								{"count", bson.D{{"$sum", 1}}},
							},
						}},
					},
				},
			},
		}},
		// Форматируем результат
		bson.D{{
			"$project",
			bson.D{
				{"total_orders", bson.D{{
					"$ifNull",
					bson.A{bson.D{{
						"$arrayElemAt",
						bson.A{"$total_orders.count", 0},
					}}, 0},
				}}},
				{"total_commissions", bson.D{{
					"$ifNull",
					bson.A{bson.D{{
						"$arrayElemAt",
						bson.A{"$total_commissions.total", 0},
					}}, 0},
				}}},
				{"completed_orders", bson.D{{
					"$ifNull",
					bson.A{bson.D{{
						"$arrayElemAt",
						bson.A{"$completed_orders.count", 0},
					}}, 0},
				}}},
				{"total_revenue", bson.D{{
					"$ifNull",
					bson.A{bson.D{{
						"$arrayElemAt",
						bson.A{"$total_revenue.total", 0},
					}}, 0},
				}}},
				{"orders_by_city", bson.D{{
					"$arrayToObject",
					bson.D{{
						"$map",
						bson.D{
							{"input", "$orders_by_city"},
							{"as", "city"},
							{"in", bson.D{
								{"k", "$$city._id"},
								{"v", "$$city.count"},
							}},
						},
					}},
				}}},
				{"orders_by_category", bson.D{{
					"$arrayToObject",
					bson.D{{
						"$map",
						bson.D{
							{"input", "$orders_by_category"},
							{"as", "category"},
							{"in", bson.D{
								{"k", bson.D{{"$toString", "$$category._id"}}},
								{"v", "$$category.count"},
							}},
						},
					}},
				}}},
			},
		}},
	}

	// Выполняем агрегацию
	cursor, err := requestsCollection.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	// Получаем результат агрегации
	var result models.Statistics
	if cursor.Next(context.TODO()) {
		err = cursor.Decode(&result)
		if err != nil {
			return nil, err
		}
	}

	// Запрос на подсчет активных мастеров
	activeMasters, err := usersCollection.CountDocuments(context.TODO(), bson.D{
		{"dismissed", false},
		{"permission", "001"},
	})
	if err != nil {
		return nil, err
	}
	result.ActiveMasters = activeMasters

	return &result, nil
}
