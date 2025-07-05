import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
  authenticate: (username: string, password: string) => Promise<boolean>;
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
      fullName: 'Администратор',
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
  };

  // Фейк-аккаунт для админа
  const adminCredentials = {
    username: 'admin',
    password: 'admin',
  };

  const authenticate = async (username: string, password: string): Promise<boolean> => {
    // Проверяем фейк-аккаунт админа
    if (username === adminCredentials.username && password === adminCredentials.password) {
      setUser(mockUsers.admin);
      return true;
    }
    
    // Здесь можно добавить проверку других ролей или интеграцию с backend
    return false;
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
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading, authenticate }}>
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

// =========================
// ИНТЕГРАЦИЯ С BACKEND (АВТОРИЗАЦИЯ)
//
// 1. Для регистрации пользователя используйте POST-запрос на /auth/signup с phone_number и password.
// 2. Для входа пользователя используйте POST-запрос на /auth/signin с phone_number и password.
//    После успешного входа сохраняйте id пользователя (и токен, если появится) в хранилище (например, AsyncStorage).
// 3. Для получения профиля пользователя используйте GET-запрос на /user/{id}.
// 4. Для смены пароля используйте PATCH-запрос на /user/changepassword с id и новым password.
// 5. Все типы User должны соответствовать модели User из backend (pkg/models/User.go).
// 6. Если backend начнёт использовать токены — добавляйте их в заголовки Authorization для защищённых запросов.
// 7. Обрабатывайте все ошибки, которые возвращает backend (error в JSON).
// =========================