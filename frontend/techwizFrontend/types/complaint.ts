// =========================
// Тип Complaint должен соответствовать структуре жалобы на backend (если появится отдельная модель Complaint).
// Если структура на backend меняется — обязательно обновить этот тип.
// Используется для работы с жалобами.
// =========================

export interface Complaint {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  status: 'open' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}