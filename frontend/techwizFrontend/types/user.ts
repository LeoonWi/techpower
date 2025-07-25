// =========================
// Тип User должен полностью соответствовать структуре User из backend (pkg/models/User.go).
// Если структура пользователя на backend меняется — обязательно обновить этот тип.
// Используется для авторизации, профиля, работы с заказами, чатами и т.д.
// =========================

export type UserRole = 'admin' | 'limitedAdmin' | 'support' | 'master' | 'senior_master' | 'premium_master';

export interface User {
  id?: string;
  role?: UserRole;
  fullName?: string;
  permission?: string;
  nickname?: string;
  phone?: string;
  photo?: string;
  city?: string;
  category?: string;
  balance?: number;
  commission?: number;
  isActive?: boolean;
  location?: {
    latitude?: number;
    longitude?: number;
  };
}