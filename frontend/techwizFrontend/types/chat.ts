// =========================
// Типы чата и сообщений должны полностью соответствовать структурам Chat и Message из backend (pkg/models/Chat.go, pkg/models/Message.go).
// Если структура на backend меняется — обязательно обновить эти типы.
// Используется для работы с чатами, real-time сообщениями (WebSocket).
// =========================

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  category: string;
}

export interface ChatCategory {
  id: string;
  name: string;
  description: string;
  participantCount: number;
  lastMessage?: ChatMessage;
}