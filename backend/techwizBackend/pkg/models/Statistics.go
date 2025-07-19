package models

// Statistics структура для хранения результата статистики
type Statistics struct {
	TotalOrders      int64          `json:"total_orders" bson:"total_orders"`
	CompletedOrders  int64          `json:"completed_orders" bson:"completed_orders"`
	TotalRevenue     float64        `json:"total_revenue" bson:"total_revenue"`
	ActiveMasters    int64          `json:"active_masters" bson:"active_masters"`
	OrdersByCity     map[string]int `json:"orders_by_city" bson:"orders_by_city"`
	OrdersByCategory map[string]int `json:"orders_by_category" bson:"orders_by_category"`
}
