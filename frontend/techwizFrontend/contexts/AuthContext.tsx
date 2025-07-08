import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, AuthRequest, AuthResponse } from '@/api/client';

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
    // Ограниченный админ - только для создания сотрудников
    limitedAdmin: {
      id: '1-limited',
      role: 'admin',
      fullName: 'Администратор (Ограниченный)',
      nickname: 'limited_admin',
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

  // Фейк-аккаунты для демо
  const demoCredentials = {
    limitedAdmin: { username: '79001234567', password: 'admin123' },
    support: { username: '79002345678', password: 'support123' },
    master: { username: '79003456789', password: 'master123' },
  };

  const authenticate = async (username: string, password: string): Promise<boolean> => {
    try {
      // Сначала пробуем подключиться к бэкенду
      try {
        const credentials: AuthRequest = {
          phone_number: username,
          password: password,
        };

        const response: AuthResponse = await apiClient.signIn(credentials);
        
        // Преобразуем данные пользователя в формат фронтенда
        const frontendUser: User = {
          id: response.user.id,
          role: response.user.permission as UserRole,
          fullName: response.user.full_name || '',
          nickname: response.user.nickname || '',
          phone: response.user.phone_number,
          city: '', // Бэкенд не предоставляет город
          category: response.user.categories?.[0]?.name || '',
          balance: response.user.balance || 0,
          commission: response.user.commission || 0,
          isActive: true, // Бэкенд не предоставляет статус активности
        };

        // Сохраняем токен и пользователя
        if (response.token) {
          await AsyncStorage.setItem('authToken', response.token);
        }
        setUser(frontendUser);
        await AsyncStorage.setItem('user', JSON.stringify(frontendUser));
        await AsyncStorage.setItem('userId', frontendUser.id);

        return true;
      } catch (backendError) {
        console.warn('Backend connection failed, falling back to mock data:', backendError);
        
        // Fallback к mock данным
        for (const [role, credentials] of Object.entries(demoCredentials)) {
          if (username === credentials.username && password === credentials.password) {
            setUser(mockUsers[role as UserRole]);
            return true;
          }
        }
        
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const login = (role: UserRole) => {
    setUser(mockUsers[role]);
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