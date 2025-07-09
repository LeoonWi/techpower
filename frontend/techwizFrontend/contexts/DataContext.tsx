import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { ChatCategory, ChatMessage } from '@/types/chat';
import { Analytics } from '@/types/analytics';
import { User } from '@/types/user';
import { Complaint } from '@/types/complaint';
import { apiClient, User as ApiUser, Category as ApiCategory, Request as ApiRequest, Chat as ApiChat, Message as ApiMessage } from '@/api/client';
import { useAuth } from './AuthContext';
import { getOrders as getLocalOrders, addOrder as addLocalOrder, deleteOrder as deleteLocalOrder, updateOrder as updateLocalOrder, LocalOrder } from '../data/orders';
import { getMasters as getLocalMasters, addMaster as addLocalMaster, deleteMaster as deleteLocalMaster, updateMaster as updateLocalMaster, LocalMaster } from '../data/masters';

interface DataContextType {
  orders: Order[];
  chatCategories: ChatCategory[];
  messages: ChatMessage[];
  masters: User[];
  complaints: Complaint[];
  isLoading: boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignOrder: (orderId: string, masterId: string) => void;
  sendMessage: (categoryId: string, content: string, senderId: string, senderName: string) => void;
  addComplaint: (title: string, description: string, authorId: string, authorName: string) => void;
  resolveComplaint: (complaintId: string, resolvedBy: string) => void;
  loadMasters: () => Promise<void>;
  loadCategories: () => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id'>) => Promise<void>;
  loadOrders: () => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addMaster: (masterData: Partial<User>) => Promise<void>;
  deleteMaster: (masterId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [masters, setMasters] = useState<User[]>([]);
  const [chatCategories, setChatCategories] = useState<ChatCategory[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Маппинг status_code (number) -> OrderStatus (string)
  function mapStatusCodeToOrderStatus(code: number): OrderStatus {
    switch (code) {
      case 1: return 'pending';
      case 2: return 'assigned';
      case 3: return 'in_progress';
      case 4: return 'completed';
      case 5: return 'cancelled';
      case 6: return 'rejected';
      case 7: return 'modernization';
      default: return 'pending';
    }
  }

  // Загрузка заказов с backend, fallback на локальные
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      try {
        const apiOrders = await apiClient.getOrders();
        setOrders(apiOrders.map(apiOrder => ({
          id: String(apiOrder.id || ''),
          title: apiOrder.problem,
          description: apiOrder.problem,
          category: '',
          city: '',
          address: apiOrder.address,
          coordinates: { latitude: 0 as number, longitude: 0 as number },
          price: Number(apiOrder.price),
          commission: 0,
          status: mapStatusCodeToOrderStatus(apiOrder.status.status_code),
          clientName: apiOrder.full_name,
          clientPhone: apiOrder.phone_number,
          assignedMasterId: apiOrder.worker_id ? String(apiOrder.worker_id) : undefined,
          createdAt: new Date(apiOrder.datetime),
          updatedAt: new Date(apiOrder.datetime),
          isPremium: false,
        })));
      } catch (backendError) {
        // fallback на локальные
        const localOrders = getLocalOrders();
        setOrders(localOrders as unknown as Order[]);
      }
    } catch (error) {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Создание заказа через backend, fallback на локальные
  const createOrder = async (orderData: Omit<Order, 'id'>): Promise<void> => {
    setIsLoading(true);
    try {
      try {
        const apiRequest: Omit<ApiRequest, 'id'> = {
          full_name: orderData.clientName,
          phone_number: orderData.clientPhone,
          address: orderData.address,
          problem: orderData.description,
          price: orderData.price,
          status: { status_code: 1, reason: '' },
          datetime: orderData.createdAt.toISOString(),
          category_id: '1',
        };
        await apiClient.createRequest(apiRequest);
      } catch (backendError) {
        addLocalOrder({ ...orderData, createdAt: orderData.createdAt || new Date(), updatedAt: orderData.updatedAt || new Date() });
      }
      await loadOrders();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление статуса заказа через backend, fallback на локальные
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setIsLoading(true);
    try {
      try {
        await apiClient.updateOrder(orderId, { status: { status_code: status } });
      } catch (backendError) {
        updateLocalOrder(orderId, { status });
      }
      await loadOrders();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление заказа через backend, fallback на локальные
  const deleteOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      try {
        await apiClient.deleteOrder(orderId);
      } catch (backendError) {
        deleteLocalOrder(orderId);
      }
      await loadOrders();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка мастеров с backend, fallback на локальные
  const loadMasters = async () => {
    setIsLoading(true);
    try {
      try {
        const apiMasters = await apiClient.getMasters();
        setMasters(apiMasters.map(apiMaster => ({
          id: String(apiMaster.id),
          role: apiMaster.permission as any,
          fullName: apiMaster.full_name || '',
          nickname: apiMaster.nickname || '',
          phone: String(apiMaster.phone_number),
          photo: apiMaster.photo || '',
          city: '',
          permission: apiMaster.permission,
          category: apiMaster.categories?.[0]?.name || '',
          balance: apiMaster.balance ? Number(apiMaster.balance) : 0,
          commission: apiMaster.commission ? Number(apiMaster.commission) : 0,
          isActive: true,
        })));
      } catch (backendError) {
        const localMasters = getLocalMasters();
        setMasters(localMasters as unknown as User[]);
      }
    } catch (error) {
      setMasters([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Создание мастера через backend, fallback на локальные
  const addMaster = async (masterData: Partial<User>) => {
    setIsLoading(true);
    try {
      try {
        await apiClient.signUp({
          phone_number: String(masterData.phone),
          password: 'defaultpass',
          permission: '100',
        });
      } catch (backendError) {
        addLocalMaster({
          fullName: String(masterData.fullName || ''),
          phone: String(masterData.phone || ''),
          city: String(masterData.city || ''),
          category: String(masterData.category || ''),
          isActive: masterData.isActive !== undefined ? masterData.isActive : true,
        });
      }
      await loadMasters();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление мастера через backend, fallback на локальные
  const deleteMaster = async (masterId: string) => {
    setIsLoading(true);
    try {
      try {
        await apiClient.changeMasterStatus(masterId, 'remove');
      } catch (backendError) {
        deleteLocalMaster(masterId);
      }
      await loadMasters();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка сотрудников с backend, fallback на локальные
  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      try {
        const apiUsers = await apiClient.getUsers();
        setEmployees(apiUsers.map(apiUser => ({
          id: String(apiUser.id),
          role: apiUser.permission as any,
          fullName: apiUser.full_name || '',
          nickname: apiUser.nickname || '',
          phone: String(apiUser.phone_number),
          photo: apiUser.photo || '',
          city: '',
          category: apiUser.categories?.[0]?.name || '',
          balance: apiUser.balance ? Number(apiUser.balance) : 0,
          commission: apiUser.commission ? Number(apiUser.commission) : 0,
          isActive: true,
        })));
      } catch (backendError) {
        const localUsers = getUsers();
        setEmployees(localUsers.map(u => ({
          id: u.id,
          role: u.role,
          fullName: u.fullName || '',
          nickname: '',
          phone: u.phone,
          city: '',
          category: '',
          balance: 0,
          commission: 0,
          isActive: true,
        })));
      }
    } catch (error) {
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для загрузки категорий с бэкенда
  const loadCategories = async () => {
    try {
      const apiCategories = await apiClient.getCategories();
      const frontendCategories: ChatCategory[] = apiCategories.map(apiCategory => ({
        id: apiCategory.id,
        name: apiCategory.name,
        description: apiCategory.description || '',
        participantCount: 0, // Бэкенд не предоставляет количество участников
      }));
      setChatCategories(frontendCategories);
    } catch (error) {
      console.warn('Failed to load categories from backend, using mock data:', error);
      setChatCategories([]);
    }
  };

  // Интеграция WebSocket для чата
  useEffect(() => {
    const wsUrl = apiClient.getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };
    ws.onerror = (e) => console.error('WebSocket error:', e);
    return () => ws.close();
  }, []);

  // Инициализация данных
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadOrders(),
          loadMasters(),
          loadCategories(),
        ]);
        setComplaints([]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  // Назначение мастера заказу только на фронте
  const assignOrder = async (orderId: string, masterId: string) => {
    setIsLoading(true);
    try {
      updateLocalOrder(orderId, { assignedMasterId: masterId, status: 'assigned' });
      await loadOrders();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = (categoryId: string, content: string, senderId: string, senderName: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId,
      senderName,
      content,
      timestamp: new Date(),
      category: categoryId,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addComplaint = (title: string, description: string, authorId: string, authorName: string) => {
    const newComplaint: Complaint = {
      id: Date.now().toString(),
      title,
      description,
      authorId,
      authorName,
      status: 'open',
      createdAt: new Date(),
    };
    setComplaints(prev => [...prev, newComplaint]);
  };

  const resolveComplaint = (complaintId: string, resolvedBy: string) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { 
            ...complaint, 
            status: 'resolved', 
            resolvedAt: new Date(), 
            resolvedBy 
          }
        : complaint
    ));
  };

  return (
    <DataContext.Provider value={{ 
      orders, 
      chatCategories, 
      messages, 
      masters, 
      complaints,
      isLoading,
      updateOrderStatus, 
      assignOrder, 
      sendMessage, 
      addComplaint, 
      resolveComplaint,
      loadMasters,
      loadCategories,
      createOrder,
      loadOrders,
      deleteOrder,
      addMaster,
      deleteMaster,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// =========================
// ИНТЕГРАЦИЯ С BACKEND (ДАННЫЕ, ЗАКАЗЫ, ЧАТЫ, КАТЕГОРИИ)
//
// 1. Заказы (Request):
//    - Для создания заказа используйте POST-запрос на /request/create с объектом заявки (Request).
//    - Для получения заказов реализуйте GET-запрос (если появится на backend).
//    - Структура заказа должна соответствовать модели Request из backend (pkg/models/Request.go).
// 2. Категории:
//    - Получение списка: GET /category
//    - Создание: POST /category
//    - Переименование: PUT /category (id, name)
//    - Удаление: DELETE /category
// 3. Чаты:
//    - Создание чата: POST /chat/create/{member1}/{member2}
//    - Получение всех чатов пользователя: GET /chat/{userId}
//    - Получение чата между двумя пользователями: GET /chat/{member1}/{member2}
//    - Для сообщений используйте WebSocket /ws для real-time обмена.
// 4. Все типы данных должны соответствовать моделям backend (User, Request, Chat, Message, Category).
// 5. После успешных операций обновляйте локальное состояние (например, после создания заказа — обновить список заказов).
// 6. Обрабатывайте ошибки backend (error в JSON).
// =========================