import { Tabs } from 'expo-router';
import { 
  Home, 
  ClipboardList, 
  MessageSquare, 
  BarChart3, 
  User, 
  Map, 
  Users, 
  AlertTriangle,
  FileText,
  TrendingUp
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabSlider from '@/components/CustomTabSlider';

export default function TabLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const getTabsForRole = () => {
    const baseTabs = [
      {
        name: 'index',
        title: 'Главная',
        icon: Home,
      }
    ];

    // Роль-специфичные вкладки
    if (user?.role === 'support') {
      // Поддержка: заявки, жалобы и назначение заказов
      baseTabs.push(
        {
          name: 'orders',
          title: 'Заявки',
          icon: FileText,
        },
        //{
        //  name: 'complaints',
        //  title: 'Жалобы',
        //  icon: AlertTriangle,
        //},
        {
          name: 'chat',
          title: 'Чаты',
          icon: MessageSquare,
        }
      );
    } else if (user?.role === 'admin' || user?.role === 'limitedAdmin') {
      // Админ: только экран добавления сотрудников
      baseTabs.push(
        {
          name: 'addemployeescreen',
          title: 'Сотрудники',
          icon: Users,
        },
        // TODO все что дальше, для отладки
        {
          name: 'orders',
          title: 'Заявки',
          icon: FileText,
        },
        //{
        //  name: 'complaints',
        //  title: 'Жалобы',
        //  icon: AlertTriangle,
        //},
        {
          name: 'chat',
          title: 'Чаты',
          icon: MessageSquare,
        },
        {
          name: 'analytics',
          title: 'Статистика',
          icon: TrendingUp,
        }
      );
    } else {
      // Обычные мастера
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
    baseTabs.push(
      //{
      //  name: 'map',
      //  title: 'Карты',
      //  icon: Map,
      //},
      {
        name: 'profile',
        title: 'Профиль',
        icon: User,
      }
    );

    return baseTabs;
  };

  const tabs = getTabsForRole();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Скрываем стандартную табную панель
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
            }}
          />
        ))}
      </Tabs>
      <CustomTabSlider tabs={tabs} />
    </View>
  );
}