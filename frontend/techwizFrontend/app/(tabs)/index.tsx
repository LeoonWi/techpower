import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { router } from 'expo-router';
import { Wallet, TrendingUp, ClipboardList, Users, MessageSquare, Calendar, MapPin, Crown, Settings, FileText, TriangleAlert as AlertTriangle, Clock, CircleCheck as CheckCircle, ChartBar as BarChart3 } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const { orders, analytics, complaints, masterStats } = useData();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const getRoleTitle = () => {
    const roleTitles = {
      admin: 'Администратор',
      support: 'Поддержка',
      master: 'Мастер',
      senior_master: 'Старший мастер',
      premium_master: 'Премиум мастер',
    };
    return roleTitles[user.role];
  };

  const getDashboardData = () => {
    if (user.role === 'support') {
      return {
        totalComplaints: complaints.length,
        openComplaints: complaints.filter(c => c.status === 'open').length,
        resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
      };
    }

    if (user.role === 'master' || user.role === 'premium_master') {
      const userOrders = orders.filter(order => order.assignedMasterId === user.id);
      const stats = masterStats[user.id] || { orders: 0, earnings: 0, rating: 0 };
      
      return {
        activeOrders: userOrders.filter(order => 
          ['assigned', 'in_progress'].includes(order.status)
        ).length,
        completedOrders: userOrders.filter(order => order.status === 'completed').length,
        totalEarnings: stats.earnings,
        rating: stats.rating,
      };
    }

    const userOrders = orders.filter(order => 
      user.role === 'admin' || order.assignedMasterId === user.id
    );

    return {
      activeOrders: userOrders.filter(order => 
        ['assigned', 'in_progress'].includes(order.status)
      ).length,
      completedOrders: user.role === 'admin' ? analytics.completedOrders : 
        userOrders.filter(order => order.status === 'completed').length,
      totalEarnings: user.role === 'admin' ? analytics.earnings : user.balance,
    };
  };

  const dashboardData = getDashboardData();

  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Заказы',
        icon: ClipboardList,
        color: '#2563EB',
        onPress: () => router.push('/(tabs)/orders'),
      },
    ];

    if (user.role === 'support') {
      baseActions.push(
        {
          title: 'Жалобы',
          icon: AlertTriangle,
          color: '#EF4444',
          onPress: () => router.push('/(tabs)/complaints'),
        },
        {
          title: 'Чаты',
          icon: MessageSquare,
          color: '#F59E0B',
          onPress: () => router.push('/(tabs)/chat'),
        }
      );
    } else if (user.role === 'master' || user.role === 'premium_master') {
      baseActions.push(
        {
          title: 'Статистика',
          icon: BarChart3,
          color: '#7C3AED',
          onPress: () => router.push('/(tabs)/analytics'),
        },
        {
          title: 'Чаты',
          icon: MessageSquare,
          color: '#F59E0B',
          onPress: () => router.push('/(tabs)/chat'),
        }
      );
    } else {
      baseActions.push(
        {
          title: 'Карта',
          icon: MapPin,
          color: '#059669',
          onPress: () => router.push('/(tabs)/map'),
        },
        {
          title: 'Чаты',
          icon: MessageSquare,
          color: '#F59E0B',
          onPress: () => router.push('/(tabs)/chat'),
        }
      );

      if (user.role === 'admin' || user.role === 'senior_master') {
        baseActions.push(
          {
            title: 'Аналитика',
            icon: TrendingUp,
            color: '#7C3AED',
            onPress: () => router.push('/(tabs)/analytics'),
          },
          {
            title: 'Мастера',
            icon: Users,
            color: '#EA580C',
            onPress: () => router.push('/(tabs)/masters'),
          }
        );
      }
    }

    baseActions.push(
      {
        title: 'Профиль',
        icon: Users,
        color: '#64748B',
        onPress: () => router.push('/(tabs)/profile'),
      }
    );

    return baseActions;
  };

  const quickActions = getQuickActions();

  const renderSupportDashboard = () => (
    <>
      {/* Support Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <AlertTriangle size={20} color="#EF4444" />
          <Text style={styles.statNumber}>{dashboardData.totalComplaints}</Text>
          <Text style={styles.statLabel}>Всего жалоб</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>{dashboardData.openComplaints}</Text>
          <Text style={styles.statLabel}>Открытых</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.statNumber}>{dashboardData.resolvedComplaints}</Text>
          <Text style={styles.statLabel}>Решенных</Text>
        </View>
      </View>

      {/* Pending Orders */}
      <View style={styles.pendingOrdersCard}>
        <View style={styles.pendingOrdersHeader}>
          <ClipboardList size={24} color="#2563EB" />
          <Text style={styles.pendingOrdersTitle}>Ожидающие назначения</Text>
        </View>
        <Text style={styles.pendingOrdersCount}>
          {dashboardData.pendingOrders} заказов
        </Text>
        <Text style={styles.pendingOrdersSubtext}>
          Требуют назначения мастера
        </Text>
      </View>
    </>
  );

  const renderMasterDashboard = () => (
    <>
      {/* Master Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.activeOrders}</Text>
          <Text style={styles.statLabel}>Активные заказы</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.completedOrders}</Text>
          <Text style={styles.statLabel}>Выполнено</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.rating}</Text>
          <Text style={styles.statLabel}>Рейтинг</Text>
        </View>
      </View>

      {/* Earnings Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Wallet size={24} color="#2563EB" />
          <Text style={styles.balanceTitle}>Доходы</Text>
        </View>
        <Text style={styles.balanceAmount}>
          {dashboardData.totalEarnings.toLocaleString('ru-RU')} ₽
        </Text>
        <Text style={styles.commissionText}>
          Комиссия: {user.commission}%
        </Text>
      </View>
    </>
  );

  const renderDefaultDashboard = () => (
    <>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Wallet size={24} color="#2563EB" />
          <Text style={styles.balanceTitle}>Баланс</Text>
        </View>
        <Text style={styles.balanceAmount}>
          {user.balance.toLocaleString('ru-RU')} ₽
        </Text>
        <Text style={styles.commissionText}>
          Комиссия: {user.commission}%
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.activeOrders}</Text>
          <Text style={styles.statLabel}>Активные заказы</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.completedOrders}</Text>
          <Text style={styles.statLabel}>Выполнено</Text>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.fullName}</Text>
              {user.role === 'premium_master' && (
                <Crown size={20} color="#FFD700" style={styles.crownIcon} />
              )}
            </View>
            <Text style={styles.userRole}>{getRoleTitle()}</Text>
          </View>
          <TouchableOpacity style={styles.locationContainer}>
            <MapPin size={16} color="#64748B" />
            <Text style={styles.locationText}>{user.city}</Text>
          </TouchableOpacity>
        </View>

        {/* Role-specific Dashboard */}
        {user.role === 'support' && renderSupportDashboard()}
        {(user.role === 'master' || user.role === 'premium_master') && renderMasterDashboard()}
        {(user.role === 'admin' || user.role === 'senior_master') && renderDefaultDashboard()}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Быстрые действия</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={action.onPress}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <IconComponent size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Последняя активность</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              {user.role === 'support' 
                ? `Открытых жалоб: ${dashboardData.openComplaints}, Ожидающих заказов: ${dashboardData.pendingOrders}`
                : user.role === 'admin' 
                ? `Всего заказов в системе: ${orders.length}`
                : `Заказов назначено: ${orders.filter(o => o.assignedMasterId === user.id).length}`
              }
            </Text>
            <Text style={styles.activityTime}>Обновлено только что</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  crownIcon: {
    marginLeft: 8,
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 4,
  },
  balanceCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  commissionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  pendingOrdersCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingOrdersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingOrdersTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  pendingOrdersCount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  pendingOrdersSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    textAlign: 'center',
  },
  recentActivityContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
});