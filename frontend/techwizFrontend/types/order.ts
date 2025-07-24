// =========================
// Тип Order должен полностью соответствовать структуре Request из backend (pkg/models/Request.go).
// Если структура заявки/заказа на backend меняется — обязательно обновить этот тип.
// Используется для создания, отображения, обновления заказов.
// =========================

export type OrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | 'modernization';

export interface Order {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  price: number;
  commission: number;
  status: OrderStatus;
  clientName: string;
  clientPhone: string;
  assignedMasterId?: string;
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
  premium?: boolean;
}