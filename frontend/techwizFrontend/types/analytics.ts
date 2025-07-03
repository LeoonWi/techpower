// =========================
// Тип Analytics должен соответствовать структуре аналитики на backend (если появится отдельная модель Analytics).
// Если структура на backend меняется — обязательно обновить этот тип.
// Используется для отображения аналитики.
// =========================
export interface Analytics {
  totalOrders: number;
  completedOrders: number;
  earnings: number;
  commission: number;
  averageRating: number;
  ordersByCity: { [key: string]: number };
  ordersByCategory: { [key: string]: number };
  monthlyStats: {
    month: string;
    orders: number;
    earnings: number;
  }[];
}