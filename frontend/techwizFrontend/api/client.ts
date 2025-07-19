import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Базовый URL для бэкенда
const URL_SERV = '192.168.0.114:8080';

// Тестовый аккаунт админа на сервера:
// 7 978 588 22-72
// qwerty

// Определяем базовый URL с проверкой на production
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }
  
  // В production APK используем полный URL
  return `http://${URL_SERV}`;
};

const API_BASE_URL = getBaseURL();

// Логирование для отладки
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Platform.OS:', Platform.OS);

// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Интерфейс для аутентификации
export interface AuthRequest {
  phone_number: string;
  password: string;
  permission: string
}

export interface AuthResponse {
  id: string;
}

// Интерфейс пользователя (соответствует бэкенду)
export interface User {
  id: string;
  phone_number: string;
  full_name?: string;
  nickname?: string;
  permission: string;
  photo?: string;
  status?: string;
  categories?: Category[];
  balance?: number;
  commission?: number;
  dismissed?: boolean;
}

// Интерфейс категории
export interface Category {
  id: string;
  name: string;
  description?: string;
}

// Интерфейс заказа (request)
export interface Request {
  id?: string;
  full_name: string;
  phone_number: string;
  address: string;
  problem: string;
  price: number;
  status: {
    code: number;
    reason?: string;
  };
  datetime: string;
  category_id: string;
  worker_id?: string;
}

// Интерфейс чата
export interface Chat {
  id: string;
  members: string[];
  messages?: Message[];
}

// Интерфейс сообщения
export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // Увеличен таймаут для production
      headers: {
        'Content-Type': 'application/json',
      },
      // Дополнительные настройки для production
      ...(Platform.OS !== 'web' && {
        validateStatus: (status) => status < 500, // Принимаем все статусы < 500
      }),
    });

    // Добавляем интерцептор для автоматического добавления токена
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Добавляем интерцептор для обработки ошибок
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.log('HTTP Error:', error.message);
        console.log('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
          },
        });

        if (error.response?.status === 401) {
          // Токен истек или недействителен
          SecureStore.deleteItemAsync('authToken');
          SecureStore.deleteItemAsync('user');
        }
        
        // Улучшенная обработка сетевых ошибок
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          console.log('Network error detected, check server connection');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Аутентификация
  async signIn(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/signin', credentials);
    return response.data;
  }

  async signUp(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/signup', userData);
    return response.data;
  }

  // Пользователи
  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>('/user');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.client.get<User>(`/user/${id}`);
    if (response.status === 200) {
        return response.data;
    }
    throw new Error('User not found');
  }

  async getMasters(): Promise<User[]> {
    const response = await this.client.get<User[]>('/user/masters');
    return response.data;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    await this.client.patch('/user/changepassword', {
      id: userId,
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  // Обновление пользователя
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await this.client.put<User>(`/user/${userId}`, data);
    return response.data;
  }

  async changePermission(userId: string, oldPermission: string, newPermission: string): Promise<void> {
    await this.client.patch(`/user/changepermission/${userId}/${oldPermission}/${newPermission}`);
  }

  async addUserCategory(userId: string, categoryId: string): Promise<void> {
    await this.client.patch('/user/category/add', {
      user: userId,
      category: categoryId,
    });
  }

  async removeUserCategory(userId: string, categoryId: string): Promise<void> {
    await this.client.patch('/user/category/remove', {
      user: userId,
      category: categoryId,
    });
  }

  async changeMasterStatus(userId: string, event: 'add' | 'remove', status?: string): Promise<void> {
    const params = new URLSearchParams({
      id: userId,
      event,
    });
    if (status) {
      params.append('status', status);
    }
    await this.client.patch(`/user/master?${params.toString()}`);
  }

  async dismissUser(userId: string): Promise<void> {
    await this.client.patch(`/user/dismiss/${userId}`);
  }

  // Категории
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>('/category');
    return response.data;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await this.client.post<Category>('/category', category);
    return response.data;
  }

  async updateCategory(category: Category): Promise<Category> {
    const response = await this.client.put<Category>('/category', category);
    return response.data;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.client.delete(`/category?id=${categoryId}`);
  }

  // Чаты
  async getChats(userId: string): Promise<Chat[]> {
    const response = await this.client.get<Chat[]>(`/chat/${userId}`);
    return response.data;
  }

  async createChat(member1: string, member2: string): Promise<Chat> {
    const response = await this.client.post<Chat>(`/chat/create/${member1}/${member2}`);
    return response.data;
  }

  async addUserToChat(chatId: string, userId: string): Promise<void> {
    await this.client.post(`/chat/${chatId}/${userId}`);
  }

  async removeUserFromChat(chatId: string, userId: string): Promise<void> {
    await this.client.delete(`/chat/${chatId}/${userId}`);
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    // Удаляем пользователя из чата, что фактически "удаляет" чат для этого пользователя
    await this.client.delete(`/chat/${chatId}/${userId}`);
  }

  // Заказы (Requests)
  async createRequest(request: Omit<Request, 'id'>): Promise<Request> {
    const response = await this.client.post<Request>('/request', request);
    return response.data;
  }

  async getOrders(): Promise<Request[]> {
    const response = await this.client.get<Request[]>('/request');
    return response.data;
  }

  async getOrder(id: string): Promise<Request> {
    const response = await this.client.get<Request>(`/request/${id}`);
    return response.data;
  }

  async updateOrder(id: string, order: Partial<Request>): Promise<void> {
    await this.client.patch(`/request/${id}`, order);
  }

  async deleteOrder(id: string): Promise<void> {
    await this.client.delete(`/request/${id}`);
  }

  async attachMasterToRequest(requestId: string, userId: string): Promise<void> {
    await this.client.patch(`/request/attach/${requestId}/${userId}`);
  }

  async changeStatusRequest(requestId: string, status: { status_code: number, reason?: string }): Promise<void> {
    await this.client.patch('/request', { id: requestId, status });
  }

  async requestInSpot(requestId: string): Promise<void> {
    await this.client.patch('/request/in_spot', { id: requestId });
  }

  // WebSocket URL
  getWebSocketUrl(): string {
    if (Platform.OS === 'web') {
      return 'ws://192.168.0.114:8080/ws';
    } else {
      return `ws://${URL_SERV}/ws`;
    }
  }
}

// Экспортируем единственный экземпляр клиента
export const apiClient = new ApiClient();
export default apiClient; 
