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