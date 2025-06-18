import React, { createContext, useContext, useState } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { ChatCategory, ChatMessage } from '@/types/chat';
import { Analytics } from '@/types/analytics';

interface DataContextType {
  orders: Order[];
  chatCategories: ChatCategory[];
  messages: ChatMessage[];
  analytics: Analytics;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignOrder: (orderId: string, masterId: string) => void;
  sendMessage: (categoryId: string, content: string, senderId: string, senderName: string) => void;
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

  return (
    <DataContext.Provider value={{
      orders,
      chatCategories,
      messages,
      analytics,
      updateOrderStatus,
      assignOrder,
      sendMessage,
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