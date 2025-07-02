import { Tabs } from 'expo-router';
import { Chrome as Home, ClipboardList, MessageSquare, ChartBar as BarChart3, User, Map, Users, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { user } = useAuth();

  const getTabsForRole = () => {
    const baseTabs = [
      {
        name: 'index',
        title: 'Главная',
        icon: Home,
      },
    ];

    // Роль-специфичные вкладки
    if (user?.role === 'support') {
      // Поддержка: заявки, жалобы и назначение заказов
      baseTabs.push(
        {
          name: 'orders',
          title: 'Заявки',
          icon: ClipboardList,
        },
        {
          name: 'complaints',
          title: 'Жалобы',
          icon: AlertTriangle,
        },
        {
          name: 'chat',
          title: 'Чаты',
          icon: MessageSquare,
        }
      );
    } else if (user?.role === 'senior_master') {
      // Старший мастер: заказы, аналитика, управление мастерами
      baseTabs.push(
        {
          name: 'orders',
          title: 'Заказы',
          icon: ClipboardList,
        },
        {
          name: 'analytics',
          title: 'Аналитика',
          icon: BarChart3,
        },
        {
          name: 'masters',
          title: 'Мастера',
          icon: Users,
        },
        {
          name: 'chat',
          title: 'Чаты',
          icon: MessageSquare,
        }
      );
    } else if (user?.role === 'admin') {
      // Админ: все функции
      baseTabs.push(
        {
          name: 'orders',
          title: 'Заказы',
          icon: ClipboardList,
        },
        {
          name: 'map',
          title: 'Карта',
          icon: Map,
        },
        {
          name: 'chat',
          title: 'Чаты',
          icon: MessageSquare,
        },
        {
          name: 'analytics',
          title: 'Аналитика',
          icon: BarChart3,
        },
        {
          name: 'masters',
          title: 'Мастера',
          icon: Users,
        }
      );
    } else {
      // Обычные мастера и премиум мастера
      baseTabs.push(
        {
          name: 'orders',
          title: 'Заказы',
          icon: ClipboardList,
        },
        {
          name: 'analytics',
          title: 'Статистика',
          icon: BarChart3,
        },
        {
          name: 'chat',
          title: 'Чаты',
          icon: MessageSquare,
        }
      );
    }

    // Профиль для всех
    baseTabs.push({
      name: 'profile',
      title: 'Профиль',
      icon: User,
    });

    return baseTabs;
  };

  const tabs = getTabsForRole();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0, // Убрана верхняя граница
          borderTopColor: '#E2E8F0',
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 90 : 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 11,
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={({ focused }) => ({
              title: tab.title,
              tabBarIcon: ({ size, color }) => (
                <IconComponent 
                  size={focused ? size + 3 : size} 
                  color={color}
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
              tabBarLabelStyle: {
                fontFamily: focused ? 'Inter-Bold' : 'Inter-Regular',
                fontSize: focused ? 12 : 11,
                marginTop: 4,
                marginBottom: 2,
              },
            })}
          />
        );
      })}
    </Tabs>
  );
}