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