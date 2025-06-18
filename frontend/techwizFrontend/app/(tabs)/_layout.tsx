import { Tabs } from 'expo-router';
import { Chrome as Home, ClipboardList, MessageSquare, ChartBar as BarChart3, User, Settings, Map } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

  const getTabsForRole = () => {
    const baseTabs = [
      {
        name: 'index',
        title: 'Главная',
        icon: Home,
      },
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
    ];

    if (user?.role === 'admin' || user?.role === 'senior_master') {
      baseTabs.push({
        name: 'analytics',
        title: 'Аналитика',
        icon: BarChart3,
      });
    }

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
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Regular',
          fontSize: 12,
        },
      }}
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ size, color }) => (
                <IconComponent size={size} color={color} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}