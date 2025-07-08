export interface LocalOrder {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string;
  address: string;
  description: string;
  price: number;
  category: string;
  city: string;
  coordinates: { latitude: number; longitude: number };
  commission: number;
  status: string;
  assignedMasterId?: string;
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
}

let orders: LocalOrder[] = [];

export function getOrders(): LocalOrder[] {
  return orders;
}

export function addOrder(order: Omit<LocalOrder, 'id'>) {
  const newOrder: LocalOrder = { ...order, id: Date.now().toString() };
  orders.push(newOrder);
}

export function deleteOrder(id: string) {
  orders = orders.filter(order => order.id !== id);
}

export function updateOrder(id: string, update: Partial<LocalOrder>) {
  orders = orders.map(order => order.id === id ? { ...order, ...update, updatedAt: new Date() } : order);
} 