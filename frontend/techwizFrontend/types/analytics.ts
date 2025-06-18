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