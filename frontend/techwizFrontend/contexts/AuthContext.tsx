import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import * as SecureStore from 'expo-secure-store';
import { apiClient, AuthRequest, AuthResponse } from '@/api/client';
import { getUsers, addUser, findUser, findUserByPhone, LocalUser } from '../data/users';
import { permissionToRole } from '@/utils/roleUtils';

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

  // Загрузка полных данных пользователя по ID
  const loadUserData = async (userId: string): Promise<User | null> => {
    try {
      const userData = await apiClient.getUser(userId);
      
      // Валидация данных от API
      if (!userData || !userData.id || !userData.permission) {
        console.error('Invalid user data received from API:', userData);
        return null;
      }
      
      const frontendUser: User = {
        id: userData.id,
        role: permissionToRole(userData.permission),
        fullName: userData.full_name,
        permission: userData.permission,
        nickname: userData.nickname,
        phone: userData.phone_number,
        photo: userData.photo,
        balance: userData.balance,
        category: Array.isArray(userData.categories) ? userData.categories[0].name : 'Отсутствует',
        commission: userData.commission,
        isActive: !userData.dismissed,
      };
      return frontendUser;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  };

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
      console.log('Auth: API endpoint will be called');
      
      const response: AuthResponse = await apiClient.signIn(credentials);
      console.log('Auth: API response received', response);
      
      if (response.id) {
        console.log('Auth: loading user data for id:', response.id);
        // Загружаем полные данные пользователя
        const userData = await loadUserData(response.id);
        if (userData) {
          setUser(userData);
          await SecureStore.setItemAsync('userId', response.id);
          console.log('Auth: user loaded with role:', userData.role);
          return true;
        } else {
          console.log('Auth: failed to load user data');
        }
      } else {
        console.log('Auth: no user ID in response');
      }
      return false;
    } catch (backendError: any) {
      console.log('Auth: error details', {
        message: backendError?.message,
        status: backendError?.response?.status,
        data: backendError?.response?.data,
        code: backendError?.code,
      });
      return false;
    }
  };

  const login = (role: UserRole) => {
  };

  const logout = async () => {
    setUser(null);
    // Очищаем сохраненные данные пользователя
    try {
      await SecureStore.deleteItemAsync('userId');
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

  // Проверка сохраненного пользователя при инициализации
  useEffect(() => {
    // Очищаем куки/хранилище при каждом запуске приложения
    const clearSession = async () => {
      try {
        await SecureStore.deleteItemAsync('userId');
        await SecureStore.deleteItemAsync('authToken');
        setUser(null);
      } catch (error) {
        console.error('Error clearing session on app start:', error);
      }
    };
    clearSession();
    const checkStoredUser = async () => {
      setIsLoading(true);
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');
        if (storedUserId) {
          const userData = await loadUserData(storedUserId);
          if (userData) {
            setUser(userData);
            console.log('Auth: restored user with role:', userData.role);
          } else {
            // Если не удалось загрузить данные пользователя, очищаем хранилище
            console.log('Auth: failed to load user data, clearing storage');
            await SecureStore.deleteItemAsync('userId');
            await SecureStore.deleteItemAsync('authToken');
          }
        }
      } catch (error) {
        console.error('Error checking stored user:', error);
        // При ошибке также очищаем хранилище
        try {
          await SecureStore.deleteItemAsync('userId');
          await SecureStore.deleteItemAsync('authToken');
        } catch (clearError) {
          console.error('Error clearing storage:', clearError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkStoredUser();
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