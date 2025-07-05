// =========================
// Типы чата и сообщений должны полностью соответствовать структурам Chat и Message из backend (pkg/models/Chat.go, pkg/models/Message.go).
// Если структура на backend меняется — обязательно обновить эти типы.
// Используется для работы с чатами, real-time сообщениями (WebSocket).
// =========================
import {Category} from "./category";
export interface ChatMessage {
  id?: string;
  senderId: string;
  recipientId?: string;
  chatId: string;
  text: string;
  createdAt?: string;
}

export interface ChatCategory {
  id: string;
  name: string;
  MembersId: string[];
  Category: Category;
  CategoryId?: string;
}