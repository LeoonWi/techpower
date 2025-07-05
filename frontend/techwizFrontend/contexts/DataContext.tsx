import api from '../api/axios';
import React, { createContext, useContext, useState } from 'react';
import { Request, Status } from '@/types/request';
import { ChatCategory, ChatMessage } from '@/types/chat';
import { Analytics } from '@/types/analytics';
import { User } from '@/types/user';
import { Complaint } from '@/types/complaint';
import {Category} from "@/types/category";
import { useWebSocket } from "@/api/useWebSocket";
interface DataContextType {
  orders: Request[];
  messages: ChatMessage[];
  analytics: Analytics;
  masters: User[];
  masterStats: { [key: string]: { orders: number; earnings: number; rating: number } };
  complaints: Complaint[];
  createOrder: (order: Request) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Status) => void;
  //assignOrder: (orderId: string, masterId: string) => void;
  sendMessage: (chatId: string, text: string, senderId: string, recipientId?: string) => void;
  addComplaint: (title: string, description: string, authorId: string, authorName: string) => void;
  resolveComplaint: (complaintId: string, resolvedBy: string) => void;

  categories: Category[];
  fetchCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  chatCategories: ChatCategory[];
  createChat: (member1: string, member2: string, name: string, categoryId: string) => Promise<void>;
  fetchChats: (userId: string) => Promise<void>;
  fetchChatBetween: (member1: string, member2: string) => Promise<ChatCategory | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const userId = localStorage.getItem('userId') || '';
  const { sendMessage: sendSocketMessage } = useWebSocket(userId, (msg) => {
    setMessages(prev => [...prev, msg]);
  });
  const [orders, setOrders] = useState<Request[]>([
    {
      id: '1',
      full_name: 'Ремонт ноутбука ASUS',
      phone_number: '+7 999 123-45-67',
      address: 'Москва ул. Тверская, 12',
      problem: 'Не включается, возможно проблема с материнской платой. Требуется диагностика и замена компонентов.',
      price: 5000,
      status: {
        status_code: 0,
        reason: ''
      },
      files: [],
      datetime: new Date('2025-01-01'),
      category:{name: "Ремонт"},
      category_id: '12',
      worker: {
        phone_number: '',
        full_name: '',
        password: '',
        isActive: false
      },
      worker_id:'654321',
      isPremium: false,
    },
    {
      id: '2',
      full_name: 'Установка умного дома',
      phone_number: '+7 999 234-56-78',
      address: 'Невский проспект, 45',
      problem: 'Установка системы умного дома в квартире: датчики, камеры, автоматизация освещения.',
      price: 15000,
      status: {
        status_code: 0,
        reason: ''
      },
      files: [],
      datetime: new Date('2025-01-02'),
      category:{name:"умного дома"},
      category_id: '12',
      worker: {
        phone_number: '',
        full_name: 'Мария Сидорова',
        password: '',
        isActive: false
      },
      worker_id:'654321',
      isPremium: true,
    },
    {
      id: '3',
      full_name: 'Ремонт iPhone 14',
      phone_number: '+7 999 345-67-89',
      address: 'ул. Баумана, 78',
      problem: 'Замена экрана и батареи. Телефон упал, экран треснул, батарея быстро разряжается.',
      price: 8000,
      status: {
        status_code: 0,
        reason: ''
      },
      files: [],
      datetime: new Date('2025-01-03'),
      category:{name:'Мобильные устройства'},
      category_id: '12',
      worker: {
        phone_number: '',
        full_name: 'Алексей Смирнов',
        password: '',
        isActive: false
      },
      worker_id:'654321',
      isPremium: false,
    },
    {
      id: '4',
      full_name: 'Настройка сервера',
      phone_number: '+7 999 456-78-90',
      address: 'ул. Ленина, 25',
      problem: 'Настройка и оптимизация сервера для малого бизнеса. Установка ПО, настройка безопасности.',
      price: 12000,
      status: {
        status_code: 0,
        reason: ''
      },
      files: [],
      datetime: new Date('2025-01-04'),
      category:{name:'Компьютеры'},
      category_id: '12',
      worker: {
        phone_number: '',
        full_name: 'Ольга Козлова',
        password: '',
        isActive: false
      },
      worker_id:'654321',
      isPremium: true,
    },
    {
      id: '5',
      full_name: 'Ремонт стиральной машины',
      phone_number: '+7 999 567-89-01',
      address: 'ул. Малышева, 101',
      problem: 'Не сливает воду, издает странные звуки при отжиме. Требуется диагностика.',
      price: 3500,
      status: {
        status_code: 0,
        reason: ''
      },
      files: [],
      datetime: new Date('2025-01-05'),
      category:{name:'Ремонт техники'},
      category_id: '12',
      worker: {
        phone_number: '',
        full_name: 'Дмитрий Волков',
        password: '',
        isActive: false
      },
      worker_id:'654321',
      isPremium: false,
    },
    {
      id: '6',
      full_name: 'Ремонт кондиционера',
      phone_number: '+7 999 678-90-12',
      address: 'ул. Арбат, 25',
      problem: 'Кондиционер не охлаждает, требуется заправка фреоном и чистка фильтров.',
      price: 15000,
      status: {
        status_code: 0,
        reason: ''
      },
      files: [],
      datetime: new Date('2025-01-06'),
      category:{name:'Ремонт техники'},
      category_id: '12',
      worker: {
        phone_number: '',
        full_name: 'Елена Васильева',
        password: '',
        isActive: false
      },
      worker_id:'654321',
      isPremium: false,
    },
    {
      id: '7',
      full_name: 'Установка видеонаблюдения',
      phone_number: '+7 999 789-01-23',
      address: 'ул. Рубинштейна, 15',
      problem: 'Установка системы видеонаблюдения в офисе: 8 камер, сервер записи, настройка удаленного доступа.',
      price: 15000,
      status: {
        status_code: 0,
        reason: ''
      },
      files: [],
      datetime: new Date('2025-01-07'),
      category:{name:'Электроника'},
      category_id: '12',
      worker: {
        phone_number: '',
        full_name: 'ООО "Бизнес Центр',
        password: '',
        isActive: false
      },
      worker_id:'754321',
      isPremium: true,
    },
  ]);

  const [chatCategories, setChatCategories] = useState<ChatCategory[]>([
    {
      id: '1',
      name: 'Компьютеры',
      MembersId: [],
      Category: {id: '1',name: 'Чат Компьютеры'}
    },
    {
      id: '2',
      name: 'Электроника',
      MembersId: [],
      Category: {id: '2',name: 'Чат Электроника'}
    },
    {
      id: '3',
      name: 'Мобильные устройства',
      MembersId: [],
      Category:{id: '3',name: 'Чат Мобилка'}
    },
    {
      id: '4',
      name: 'Ремонт техники',
      MembersId: [],
      Category: {id: '4',name: 'Чат Ремонт'}
    },
    {
      id: 'support',
      name: 'Поддержка',
      MembersId: [],
      Category:{id: '5',name: 'Чат Поддержка'}
    },
    {
      id: 'senior_master',
      name: 'Старший мастер',
      MembersId: [],
      Category: {id: '6',name: 'Чат со старшим мастером'}
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([]);


  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg1',
      senderId: '3',
      text: 'Кто-нибудь сталкивался с проблемой перегрева на ASUS?',
      createdAt: new Date(),
      chatId: '1',
    },
    {
      id: 'msg2',
      senderId: '4',
      text: 'Да, обычно проблема в термопасте или забитых вентиляторах',
      createdAt: new Date(Date.now() - 300000),
      chatId: '1',
    },
  ]);

  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      title: 'Жалоба на качество работы',
      description: 'Мастер выполнил работу некачественно, устройство снова сломалось через день',
      authorId: '6',
      authorName: 'Клиент Недовольный',
      status: 'open',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: '2',
      title: 'Нарушение сроков',
      description: 'Заказ должен был быть выполнен вчера, но мастер до сих пор не приступил к работе',
      authorId: '7',
      authorName: 'Клиент Ожидающий',
      status: 'open',
      createdAt: new Date(Date.now() - 43200000),
    },
    {
      id: '3',
      title: 'Некорректное поведение мастера',
      description: 'Мастер был груб и невежлив во время выполнения работы',
      authorId: '8',
      authorName: 'Клиент Расстроенный',
      status: 'resolved',
      createdAt: new Date(Date.now() - 172800000),
      resolvedAt: new Date(Date.now() - 86400000),
      resolvedBy: '2',
    },
  ]);

  const masters: User[] = [
    {
      id: '3',
      status: 'master',
      full_name: 'Мастер Обычный',
      permission:"001",
      nickname: 'master',
      phone_number: '+7 900 345-67-89',
      categories: [],
      balance: 25000,
      commission: 15,
      isActive: true,
    },
    {
      id: '4',
      status: 'master',
      full_name: 'Мастер Старший',
      permission:"001",
      nickname: 'senior_master',
      phone_number: '+7 900 456-78-90',
      categories: [],
      balance: 75000,
      commission: 12,
      isActive: true,
    },
    {
      id: '5',
      status: 'master',
      full_name: 'Мастер Премиум',
      permission:"001",
      nickname: 'premium_master',
      phone_number: '+7 900 567-89-01',
      categories:[],
      balance: 120000,
      commission: 8,
      isActive: true,
    },
    {
      id: '8',
      status: 'master',
      full_name: 'Петров Иван Сергеевич',
      permission:"001",
      nickname: 'ivan_master',
      phone_number: '+7 900 111-22-33',
      categories: [],
      balance: 18000,
      commission: 15,
      isActive: false,
    },
    {
      id: '9',
      status: 'master',
      full_name: 'Сидорова Анна Владимировна',
      permission:"001",
      nickname: 'anna_premium',
      phone_number: '+7 900 444-55-66',
      categories: [],
      balance: 95000,
      commission: 8,
      isActive: true,
    },
  ];

  const masterStats = {
    '3': { orders: 24, earnings: 45000, rating: 4.6 },
    '4': { orders: 38, earnings: 78000, rating: 4.9 },
    '5': { orders: 42, earnings: 125000, rating: 4.8 },
    '8': { orders: 15, earnings: 28000, rating: 4.2 },
    '9': { orders: 35, earnings: 89000, rating: 4.7 },
  };

  const analytics: Analytics = {
    totalOrders: 156,
    completedOrders: 134,
    earnings: 285000,
    commission: 34200,
    averageRating: 4.8,
    ordersByCity: {
      'Москва': 45,
      'Санкт-Петербург': 32,
      'Казань': 28,
      'Новосибирск': 25,
      'Екатеринбург': 26,
    },
    ordersByCategory: {
      'Компьютеры': 52,
      'Электроника': 48,
      'Мобильные устройства': 35,
      'Ремонт техники': 21,
    },
    monthlyStats: [
      { month: 'Янв', orders: 25, earnings: 45000 },
      { month: 'Фев', orders: 32, earnings: 58000 },
      { month: 'Мар', orders: 28, earnings: 52000 },
      { month: 'Апр', orders: 35, earnings: 65000 },
      { month: 'Май', orders: 36, earnings: 65000 },
    ],
  };

  const createOrder = async (newOrder: Request) => {
    try {
      await api.post('/request/create', newOrder);

      setOrders(prev => [
        ...prev,
        {
          ...newOrder,
          id: Date.now().toString(), // пока нет реального id из бэка
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    } catch (err: any) {
      console.error('Ошибка создания заказа:', err.response?.data || err.message);
      throw err;
    }
  };


  const updateOrderStatus = (orderId: string, status: Status) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() }
        : order
    ));
  };

  // const assignOrder = (orderId: string, masterId: string) => {
  //   setOrders(prev => prev.map(order =>
  //     order.id === orderId
  //       ? { ...order, assignedMasterId: masterId, status: 'assigned', updatedAt: new Date() }
  //       : order
  //   ));
  // };

  const sendMessage = (
      chatId: string,
      text: string,
      senderId: string,
      recipientId?:string,
  ) => {
    const message: ChatMessage = {
      senderId,
      recipientId,
      chatId,
      text,
    };

    sendSocketMessage(message);
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
            status: 'resolved' as const,
            resolvedAt: new Date(),
            resolvedBy,
          }
        : complaint
    ));
  };
  const fetchCategories = async () => {
    try {
      const response = await api.get('/category');
      setCategories(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки категорий:', err.response?.data || err.message);
    }
  };

  const createCategory = async (name: string) => {
    try {
      const response = await api.post('/category', { name });
      setCategories(prev => [...prev, response.data]);
    } catch (err: any) {
      console.error('Ошибка создания категории:', err.response?.data || err.message);
      throw err;
    }
  };

  const renameCategory = async (id: string, name: string) => {
    try {
      const response = await api.put('/category', null, {
        params: { id, name }
      });
      setCategories(prev => prev.map(c => c.id === id ? response.data : c));
    } catch (err: any) {
      console.error('Ошибка переименования категории:', err.response?.data || err.message);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await api.delete('/category', {
        data: { id }
      });
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Ошибка удаления категории:', err.response?.data || err.message);
      throw err;
    }
  };
  const createChat = async (member1: string, member2: string, name: string, categoryId: string) => {
    try {
      const response = await api.post(`/chat/create/${member1}/${member2}`, {
        name,
        category_id: categoryId,
      });
      const newChat: ChatCategory = response.data;
      setChatCategories(prev => [...prev, newChat]);
    } catch (err: any) {
      console.error('Ошибка создания чата:', err.response?.data || err.message);
      throw err;
    }
  };
  const fetchChats = async (userId: string) => {
    try {
      const response = await api.get(`/chat/${userId}`);
      setChatCategories(response.data); // предполагается, что backend возвращает массив чатов
    } catch (err: any) {
      console.error('Ошибка загрузки чатов:', err.response?.data || err.message);
      throw err;
    }
  };
  const fetchChatBetween = async (member1: string, member2: string): Promise<ChatCategory | null> => {
    try {
      const response = await api.get(`/chat/${member1}/${member2}`);
      return response.data; // один чат
    } catch (err: any) {
      console.error('Ошибка получения чата между пользователями:', err.response?.data || err.message);
      return null;
    }
  };

  return (
    <DataContext.Provider value={{
      orders,
      messages,
      analytics,
      masters,
      masterStats,
      complaints,
      createOrder,
      updateOrderStatus,
      //assignOrder,
      sendMessage,
      addComplaint,
      resolveComplaint,

      categories,
      fetchCategories,
      createCategory,
      renameCategory,
      deleteCategory,

      chatCategories,
      createChat,
      fetchChats,
      fetchChatBetween,
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