import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, AuthRequest, AuthResponse } from '@/api/client';
import { getUsers, addUser, findUser, findUserByPhone, LocalUser } from '../data/users';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
  authenticate: (username: string, password: string, permission: string) => Promise<boolean>;
  registerUser: (user: { phone: string; password: string; role: UserRole; fullName?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  // Фейк-аккаунты для демо
  const demoCredentials = {
    limitedAdmin: { username: '79001234567', password: 'admin123' },
    support: { username: '79002345678', password: 'support123' },
    master: { username: '79003456789', password: 'master123' },
  };

  const authenticate = async (username: string, password: string, permission: string): Promise<boolean> => {
    try {
      const credentials: AuthRequest = {
        phone_number: username,
        password: password,
        permission: permission
      };
      console.log('Auth: sending credentials', credentials);
      const response: AuthResponse = await apiClient.signIn(credentials);
      console.log('Auth: API response', response);
      console.log('Auth: user', response.id);
      const frontendUser: User = {
        id: response.id
      };
      console.log('Auth: frontendUser', frontendUser);
      await AsyncStorage.setItem('userId', frontendUser.id ? frontendUser.id : '');
      return true;
    } catch (backendError) {
      console.log('Auth: error', backendError);
      return false;
    }
  };

  const login = (role: UserRole) => {
  };

  const logout = async () => {
    setUser(null);
    // Очищаем сохраненные данные пользователя
    try {
      await AsyncStorage.removeItem('userId');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  // Регистрация пользователя: сначала backend, если не получилось — локально
  const registerUser = async (user: { phone: string; password: string; role: UserRole; fullName?: string }) => {
    try {
      // Пробуем зарегистрировать через backend
      try {
        await apiClient.signUp({
          phone_number: user.phone,
          password: user.password,
          permission: user.role,
          full_name: user.fullName || '',
        });
        return true;
      } catch (backendError) {
        // Если backend не отвечает или ошибка — fallback на локальных пользователей
        if (findUserByPhone(user.phone)) {
          return false;
        }
        addUser({
          phone: user.phone,
          password: user.password,
          role: (user.role === 'admin' || user.role === 'support' || user.role === 'master') ? user.role : 'support',
          fullName: user.fullName || '',
        });
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading, authenticate, registerUser }}>
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