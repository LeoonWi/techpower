export type UserRole = 'admin' | 'support' | 'master' | 'senior_master' | 'premium_master';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  nickname: string;
  phone: string;
  photo?: string;
  city: string;
  category: string;
  balance: number;
  commission: number;
  isActive: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}