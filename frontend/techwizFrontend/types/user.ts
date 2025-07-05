// =========================
// Тип User должен полностью соответствовать структуре User из backend (pkg/models/User.go).
// Если структура пользователя на backend меняется — обязательно обновить этот тип.
// Используется для авторизации, профиля, работы с заказами, чатами и т.д.
// =========================

export type UserStatus  = 'admin' | 'support' | 'master';
import {Category} from "./category";

export interface User {
  id?: string;
  phone_number: string;
  full_name: string;
  password?: string;
  permission?: string;
  status?: UserStatus;
  nickname?: string;
  photo?: string;
  categories?: Category[];
  categories_id?: string[];
  balance?: number;
  commission?: number;
  isActive: boolean;// сказать Веталю,чтоб добавил
}
