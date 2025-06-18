import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data for different roles
  const mockUsers: Record<UserRole, User> = {
    admin: {
      id: '1',
      role: 'admin',
      fullName: 'Администратор Системный',
      nickname: 'admin',
      phone: '+7 900 123-45-67',
      city: 'Москва',
      category: 'Все категории',
      balance: 150000,
      commission: 10,
      isActive: true,
    },
    support: {
      id: '2',
      role: 'support',
      fullName: 'Поддержка Техническая',
      nickname: 'support',
      phone: '+7 900 234-56-78',
      city: 'Санкт-Петербург',
      category: 'Поддержка',
      balance: 45000,
      commission: 8,
      isActive: true,
    },
    master: {
      id: '3',
      role: 'master',
      fullName: 'Мастер Обычный',
      nickname: 'master',
      phone: '+7 900 345-67-89',
      city: 'Казань',
      category: 'Ремонт техники',
      balance: 25000,
      commission: 15,
      isActive: true,
    },
    senior_master: {
      id: '4',
      role: 'senior_master',
      fullName: 'Мастер Старший',
      nickname: 'senior_master',
      phone: '+7 900 456-78-90',
      city: 'Новосибирск',
      category: 'Компьютеры',
      balance: 75000,
      commission: 12,
      isActive: true,
    },
    premium_master: {
      id: '5',
      role: 'premium_master',
      fullName: 'Мастер Премиум',
      nickname: 'premium_master',
      phone: '+7 900 567-89-01',
      city: 'Екатеринбург',
      category: 'Электроника',
      balance: 120000,
      commission: 8,
      isActive: true,
    },
  };

  const login = (role: UserRole) => {
    setUser(mockUsers[role]);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}