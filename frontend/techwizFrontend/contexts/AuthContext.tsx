import api from "../api/axios";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserStatus } from '@/types/user';
import id from "ajv/lib/vocabularies/core/id";

interface AuthContextType {
  user: User | null;
  login: (permission: string, phone: string, password: string) => Promise<void>;
  signup: (phone: string, password: string) => Promise<string>;
  changePassword: (id: string, newPassword: string) => Promise<void>; // <- добавили
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data for different roles
  const mockUsers: Record<UserStatus, User> = {
    admin: {
      id: '1',
      phone_number: '+7 900 123-45-67',
      full_name: 'Админ',
      password: '123',
      permission: 'permission',
      status: 'admin',
      nickname: 'Danya_Loch',
      categories: [],
      categories_id:[],
      balance: 69,
      commission: 10,
      isActive: true,
    },
    support: {
      id: '2',
      phone_number: '+7 900 123-45-67',
      full_name: 'Поддержка',
      password: '123',
      permission: 'permission',
      status: 'support',
      nickname: 'Edem_Loch',
      categories: [],
      categories_id:[],
      balance: 11111,
      commission: 10,
      isActive: true,
    },
    master: {
      id: '3',
      phone_number: '+7 900 123-45-67',
      full_name: 'Мастер',
      password: '123',
      permission: 'permission',
      status: 'master',
      nickname: 'UWU',
      categories: [],
      categories_id:[],
      balance: 123,
      commission: 10,
      isActive: true,
    }
  };

  const login = async (permission: string, phone_number: string, password: string) => {
    try {
      const response = await api.post('/auth/signin', {
        permission,
        phone_number,
        password,
      });
      const userId = response.data.id;
      const profile = await api.get(`/user/${userId}`);
      setUser(profile.data);
      localStorage.setItem('userId', userId);
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  };

  const signup = async (phone_number: string, password: string) => {
    try {
      const response = await api.post('/auth/signup', {
        phone_number,
        password,
      });
      const userId = response.data.id;
      return userId;
    } catch (err: any) {
      console.error('Signup error:', err.response?.data || err.message);
      throw err;
    }
  };

  const changePassword = async (id: string, newPassword: string) => {
    try {
      await api.patch('/user/changepassword', {
        id,
        password: newPassword,
      });
    } catch (err: any) {
      console.error('Change password error:', err.response?.data || err.message);
      throw err;
    }
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
      <AuthContext.Provider value={{ user, login, signup,changePassword, logout, updateUser, isLoading }}>
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