import React, { createContext, useContext, useState } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { ChatCategory, ChatMessage } from '@/types/chat';
import { Analytics } from '@/types/analytics';
import { User } from '@/types/user';
import { Complaint } from '@/types/complaint';

interface DataContextType {
  orders: Order[];
  chatCategories: ChatCategory[];
  messages: ChatMessage[];
  analytics: Analytics;
  masters: User[];
  masterStats: { [key: string]: { orders: number; earnings: number; rating: number } };
  complaints: Complaint[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignOrder: (orderId: string, masterId: string) => void;
  sendMessage: (categoryId: string, content: string, senderId: string, senderName: string) => void;
  addComplaint: (title: string, description: string, authorId: string, authorName: string) => void;
  resolveComplaint: (complaintId: string, resolvedBy: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      title: 'Ремонт ноутбука ASUS',
      description: 'Не включается, возможно проблема с материнской платой. Требуется диагностика и замена компонентов.',
      category: 'Компьютеры',
      city: 'Москва',
      address: 'ул. Тверская, 12',
      coordinates: { latitude: 55.7658, longitude: 37.6173 },
      price: 5000,
      commission: 750,
      status: 'pending',
      clientName: 'Иван Петров',
      clientPhone: '+7 999 123-45-67',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      isPremium: false,
    },
    {
      id: '2',
      title: 'Установка умного дома',
      description: 'Установка системы умного дома в квартире: датчики, камеры, автоматизация освещения.',
      category: 'Электроника',
      city: 'Санкт-Петербург',
      address: 'Невский проспект, 45',
      coordinates: { latitude: 59.9311, longitude: 30.3609 },
      price: 15000,
      commission: 1200,
      status: 'assigned',
      clientName: 'Мария Сидорова',
      clientPhone: '+7 999 234-56-78',
      assignedMasterId: '5',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
      isPremium: true,
    },
    {
      id: '3',
      title: 'Ремонт iPhone 14',
      description: 'Замена экрана и батареи. Телефон упал, экран треснул, батарея быстро разряжается.',
      category: 'Мобильные устройства',
      city: 'Казань',
      address: 'ул. Баумана, 78',
      coordinates: { latitude: 55.7887, longitude: 49.1221 },
      price: 8000,
      commission: 960,
      status: 'in_progress',
      clientName: 'Алексей Смирнов',
      clientPhone: '+7 999 345-67-89',
      assignedMasterId: '3',
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-03'),
      isPremium: false,
    },
    {
      id: '4',
      title: 'Настройка сервера',
      description: 'Настройка и оптимизация сервера для малого бизнеса. Установка ПО, настройка безопасности.',
      category: 'Компьютеры',
      city: 'Новосибирск',
      address: 'ул. Ленина, 25',
      coordinates: { latitude: 55.0084, longitude: 82.9357 },
      price: 12000,
      commission: 1440,
      status: 'completed',
      clientName: 'Ольга Козлова',
      clientPhone: '+7 999 456-78-90',
      assignedMasterId: '4',
      createdAt: new Date('2025-01-04'),
      updatedAt: new Date('2025-01-04'),
      isPremium: true,
    },
    {
      id: '5',
      title: 'Ремонт стиральной машины',
      description: 'Не сливает воду, издает странные звуки при отжиме. Требуется диагностика.',
      category: 'Ремонт техники',
      city: 'Екатеринбург',
      address: 'ул. Малышева, 101',
      coordinates: { latitude: 56.8431, longitude: 60.6454 },
      price: 3500,
      commission: 280,
      status: 'assigned',
      clientName: 'Дмитрий Волков',
      clientPhone: '+7 999 567-89-01',
      assignedMasterId: '5',
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-05'),
      isPremium: false,
    },
    {
      id: '6',
      title: 'Ремонт кондиционера',
      description: 'Кондиционер не охлаждает, требуется заправка фреоном и чистка фильтров.',
      category: 'Ремонт техники',
      city: 'Москва',
      address: 'ул. Арбат, 25',
      coordinates: { latitude: 55.7522, longitude: 37.5927 },
      price: 4500,
      commission: 675,
      status: 'pending',
      clientName: 'Елена Васильева',
      clientPhone: '+7 999 678-90-12',
      createdAt: new Date('2025-01-06'),
      updatedAt: new Date('2025-01-06'),
      isPremium: false,
    },
    {
      id: '7',
      title: 'Установка видеонаблюдения',
      description: 'Установка системы видеонаблюдения в офисе: 8 камер, сервер записи, настройка удаленного доступа.',
      category: 'Электроника',
      city: 'Санкт-Петербург',
      address: 'ул. Рубинштейна, 15',
      coordinates: { latitude: 59.9280, longitude: 30.3609 },
      price: 25000,
      commission: 2000,
      status: 'pending',
      clientName: 'ООО "Бизнес Центр"',
      clientPhone: '+7 999 789-01-23',
      createdAt: new Date('2025-01-07'),
      updatedAt: new Date('2025-01-07'),
      isPremium: true,
    },
  ]);

  const [chatCategories] = useState<ChatCategory[]>([
    {
      id: '1',
      name: 'Компьютеры',
      description: 'Обсуждение ремонта компьютеров и ноутбуков',
      participantCount: 45,
      lastMessage: {
        id: 'msg1',
        senderId: '3',
        senderName: 'Мастер Обычный',
        content: 'Кто-нибудь сталкивался с проблемой перегрева на ASUS?',
        timestamp: new Date(),
        category: '1',
      },
    },
    {
      id: '2',
      name: 'Электроника',
      description: 'Ремонт бытовой техники и электроники',
      participantCount: 38,
      lastMessage: {
        id: 'msg2',
        senderId: '4',
        senderName: 'Мастер Старший',
        content: 'Новые датчики умного дома поступили в продажу',
        timestamp: new Date(Date.now() - 3600000),
        category: '2',
      },
    },
    {
      id: '3',
      name: 'Мобильные устройства',
      description: 'Ремонт телефонов и планшетов',
      participantCount: 52,
      lastMessage: {
        id: 'msg3',
        senderId: '5',
        senderName: 'Мастер Премиум',
        content: 'iPhone 15 - особенности ремонта',
        timestamp: new Date(Date.now() - 7200000),
        category: '3',
      },
    },
    {
      id: '4',
      name: 'Ремонт техники',
      description: 'Бытовая техника и крупная электроника',
      participantCount: 29,
    },
    {
      id: 'support',
      name: 'Поддержка',
      description: 'Чат с технической поддержкой',
      participantCount: 15,
    },
    {
      id: 'senior_master',
      name: 'Старший мастер',
      description: 'Чат со старшим мастером',
      participantCount: 8,
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg1',
      senderId: '3',
      senderName: 'Мастер Обычный',
      content: 'Кто-нибудь сталкивался с проблемой перегрева на ASUS?',
      timestamp: new Date(),
      category: '1',
    },
    {
      id: 'msg2',
      senderId: '4',
      senderName: 'Мастер Старший',
      content: 'Да, обычно проблема в термопасте или забитых вентиляторах',
      timestamp: new Date(Date.now() - 300000),
      category: '1',
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
    {
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
    {
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
    {
      id: '8',
      role: 'master',
      fullName: 'Петров Иван Сергеевич',
      nickname: 'ivan_master',
      phone: '+7 900 111-22-33',
      city: 'Москва',
      category: 'Мобильные устройства',
      balance: 18000,
      commission: 15,
      isActive: false,
    },
    {
      id: '9',
      role: 'premium_master',
      fullName: 'Сидорова Анна Владимировна',
      nickname: 'anna_premium',
      phone: '+7 900 444-55-66',
      city: 'Санкт-Петербург',
      category: 'Компьютеры',
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

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() }
        : order
    ));
  };

  const assignOrder = (orderId: string, masterId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, assignedMasterId: masterId, status: 'assigned', updatedAt: new Date() }
        : order
    ));
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
            status: 'resolved' as const,
            resolvedAt: new Date(),
            resolvedBy,
          }
        : complaint
    ));
  };

  return (
    <DataContext.Provider value={{
      orders,
      chatCategories,
      messages,
      analytics,
      masters,
      masterStats,
      complaints,
      updateOrderStatus,
      assignOrder,
      sendMessage,
      addComplaint,
      resolveComplaint,
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