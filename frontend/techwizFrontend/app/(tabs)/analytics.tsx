// =========================
// Интеграция с backend (аналитика):
// - Для получения аналитики реализуйте GET-запрос на соответствующий endpoint (если появится на backend).
// - Тип аналитики должен соответствовать модели Analytics из backend (если появится).
// - После успешных операций обновляйте локальное состояние.
// - Обрабатывайте ошибки backend.
// =========================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ChartBar as BarChart3, TrendingUp, Users, DollarSign, Calendar, MapPin, Crown, Star, ClipboardList } from 'lucide-react-native';
import { apiClient } from '@/api/client'; // Импортируем apiClient

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { analytics, masters, masterStats, orders } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [adminAnalytics, setAdminAnalytics] = useState(analytics);
  const isAdmin = user?.role === 'admin' || user?.permission === '100';

  // Маппинг периода на число дней
  const periodToDays: Record<'week' | 'month' | 'year', number> = {
    week: 7,
    month: 30,
    year: 365,
  };

  // Simulate fetching analytics for a period (replace with real API call)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAnalyticsForPeriod = async (period: 'week' | 'month' | 'year') => {
    setLoading(true);
    setError(null);
    try {
      const days = periodToDays[period];
      const data = await apiClient.getStatistics();
      // Маппинг snake_case -> camelCase
      const mapped = {
        totalOrders: data.total_orders ?? 0,
        completedOrders: data.completed_orders ?? 0,
        totalCommissions: data.total_commissions ?? 0,
        earnings: data.total_revenue ?? 0,
        activeMasters: data.active_masters ?? 0,
        ordersByCity: data.orders_by_city ?? {},
        ordersByCategory: data.orders_by_category ?? {},
        monthlyStats: data.monthly_stats ?? [],
        commission: data.commission ?? 0,
        averageRating: data.average_rating ?? 0,
      };
      setAdminAnalytics(mapped);
    } catch (e: any) {
      console.error('Ошибка при загрузке статистики:', e.message);
      setError(e.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAdmin) {
      fetchAnalyticsForPeriod(selectedPeriod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, isAdmin]);

  // Проверка на наличие данных аналитики
  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Загрузка аналитики...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isAdmin && (loading || !adminAnalytics)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>{loading ? 'Загрузка аналитики...' : 'Нет данных'}</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (isAdmin && error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Ошибка: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Для мастеров показываем их личную статистику
  if (user?.role === 'master' || user?.role === 'premium_master') {
    const userOrders = orders.filter(order => order.assignedMasterId === user.id);
    const completedOrders = userOrders.filter(o => o.status === 'completed');
    const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    const userStats = masterStats[user.id || ''] || { orders: 0, earnings: 0, rating: 0 };
    
    const personalStats = [
      {
        title: 'Всего заказов',
        value: userOrders.length,
        icon: ClipboardList,
        color: '#2563EB',
        change: '+5%',
      },
      {
        title: 'Выполнено',
        value: completedOrders.length,
        icon: TrendingUp,
        color: '#10B981',
        change: '+8%',
      },
      {
        title: 'Доходы',
        value: `${totalEarnings.toLocaleString('ru-RU')} ₽`,
        icon: DollarSign,
        color: '#F59E0B',
        change: '+12%',
      },
      {
        title: 'Рейтинг',
        value: userStats.rating,
        icon: Star,
        color: '#7C3AED',
        change: '+0.2',
      },
    ];

    const statusStats = userOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Моя статистика</Text>
          <Text style={styles.subtitle}>Личная аналитика работы</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Personal Stats */}
          <View style={styles.statsGrid}>
            {personalStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                      <IconComponent size={20} color={stat.color} />
                    </View>
                    <Text style={[styles.statChange, { color: stat.color }]}>
                      {stat.change}
                    </Text>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              );
            })}
          </View>

          {/* Order Status Distribution */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <BarChart3 size={20} color="#2563EB" />
              <Text style={styles.chartTitle}>Статусы заказов</Text>
            </View>
            <View style={styles.statusStats}>
              {Object.entries(statusStats).map(([status, count]) => {
                const statusLabels = {
                  pending: 'Ожидают',
                  assigned: 'Назначены',
                  in_progress: 'В работе',
                  completed: 'Выполнены',
                  cancelled: 'Отменены',
                  rejected: 'Отклонены',
                  modernization: 'Модернизация',
                };
                const percent = userStats.orders > 0 ? Math.round((count / userStats.orders) * 100) : 0;
                return (
                  <View key={status} style={styles.statusItem}>
                    <View style={styles.statusDot} />
                    <View style={styles.statusInfo}>
                      <Text style={styles.statusName}>{statusLabels[status as keyof typeof statusLabels] || status}</Text>
                      <Text style={styles.statusCount}>{count} заказов</Text>
                    </View>
                    <Text style={styles.statusPercentage}>
                      {percent}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Recent Orders */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Calendar size={20} color="#059669" />
              <Text style={styles.chartTitle}>Последние заказы</Text>
            </View>
            <View style={styles.recentOrders}>
              {userOrders.slice(0, 5).map((order) => (
                <View key={order.id} style={styles.orderItem}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle}>{order.title}</Text>
                    <Text style={styles.orderDate}>
                      {order.createdAt.toLocaleDateString('ru-RU')}
                    </Text>
                  </View>
                  <View style={styles.orderPrice}>
                    <Text style={styles.orderPriceText}>
                      {order.price.toLocaleString('ru-RU')} ₽
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Для админов и старших мастеров показываем только для админа
  if (isAdmin) {
    const periods = [
      { key: 'week', label: 'Неделя' },
      { key: 'month', label: 'Месяц' },
      { key: 'year', label: 'Год' },
    ];

    const stats = [
      {
        title: 'Всего заказов',
        value: adminAnalytics?.totalOrders || 0,
        icon: BarChart3,
        color: '#2563EB',
        change: '+12%',
      },
      {
        title: 'Выполнено',
        value: adminAnalytics?.completedOrders || 0,
        icon: TrendingUp,
        color: '#10B981',
        change: '+8%',
      },
      {
        title: 'Общий доход',
        value: `${(adminAnalytics?.earnings || 0).toLocaleString('ru-RU')} ₽`,
        icon: DollarSign,
        color: '#F59E0B',
        change: '+15%',
      },
      {
        title: 'Активных мастеров',
        value: masters.filter(m => m.isActive).length,
        icon: Users,
        color: '#7C3AED',
        change: '+5%',
      },
    ];

    // Топ мастера по доходам
    const topMasters = masters
      .map(master => ({
        ...master,
        stats: masterStats[master.id || ''] || { orders: 0, earnings: 0, rating: 0 }
      }))
      .sort((a, b) => b.stats.earnings - a.stats.earnings)
      .slice(0, 5);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Аналитика</Text>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period.key as 'week' | 'month' | 'year')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Main Stats */}
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}> 
                      <IconComponent size={20} color={stat.color} />
                    </View>
                    <Text style={[styles.statChange, { color: stat.color }]}> 
                      {stat.change}
                    </Text>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              );
            })}
          </View>

          {/* Top Masters */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Crown size={20} color="#F59E0B" />
              <Text style={styles.chartTitle}>Топ мастера по доходам</Text>
            </View>
            <View style={styles.mastersRanking}>
              {topMasters.map((master, index) => (
                <View key={master.id} style={styles.masterRankItem}>
                  <View style={styles.masterRankLeft}>
                    <View style={[
                      styles.rankBadge,
                      { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#E2E8F0' }
                    ]}>
                      <Text style={[
                        styles.rankNumber,
                        { color: index < 3 ? 'white' : '#64748B' }
                      ]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.masterRankInfo}>
                      <View style={styles.masterNameRow}>
                        <Text style={styles.masterRankName}>{master.fullName}</Text>
                        {master.role === 'premium_master' && (
                          <Crown size={14} color="#FFD700" />
                        )}
                        {master.role === 'senior_master' && (
                          <Star size={14} color="#EA580C" />
                        )}
                      </View>
                      <Text style={styles.masterRankCity}>{master.city}</Text>
                    </View>
                  </View>
                  <View style={styles.masterRankStats}>
                    <Text style={styles.masterRankEarnings}>
                      {master.stats.earnings.toLocaleString('ru-RU')} ₽
                    </Text>
                    <Text style={styles.masterRankOrders}>
                      {master.stats.orders} заказов
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Orders by City */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <MapPin size={20} color="#2563EB" />
              <Text style={styles.chartTitle}>Заказы по городам</Text>
            </View>
            <View style={styles.cityStats}>
              {Object.entries(adminAnalytics?.ordersByCity || {}).map(([city, count]) => (
                <View key={city} style={styles.cityRow}>
                  <Text style={styles.cityName}>{city}</Text>
                  <View style={styles.cityBar}>
                    <View 
                      style={[
                        styles.cityBarFill, 
                        { width: `${(count / Math.max(...Object.values(adminAnalytics?.ordersByCity || {1:1}))) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.cityCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Orders by Category */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <BarChart3 size={20} color="#059669" />
              <Text style={styles.chartTitle}>Заказы по категориям</Text>
            </View>
            <View style={styles.categoryStats}>
              {Object.entries(adminAnalytics?.ordersByCategory || {}).map(([category, count]) => (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryDot} />
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryCount}>{count} заказов</Text>
                  </View>
                  <Text style={styles.categoryPercentage}>
                    {adminAnalytics?.totalOrders ? Math.round((count / adminAnalytics.totalOrders) * 100) : 0}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Monthly Stats */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Calendar size={20} color="#EA580C" />
              <Text style={styles.chartTitle}>Статистика по месяцам</Text>
            </View>
            <View style={styles.monthlyStats}>
              {adminAnalytics?.monthlyStats?.map((month, index) => (
                <View key={index} style={styles.monthItem}>
                  <Text style={styles.monthName}>{month.month}</Text>
                  <View style={styles.monthBar}>
                    <View 
                      style={[
                        styles.monthBarFill,
                        { 
                          height: `${(month.orders / Math.max(...(adminAnalytics?.monthlyStats?.map(m => m.orders) || [1]))) * 100}%` 
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.monthOrders}>{month.orders}</Text>
                  <Text style={styles.monthEarnings}>
                    {month.earnings.toLocaleString('ru-RU')} ₽
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Если не админ и не мастер, нет доступа
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.accessDenied}>
        <Text style={styles.accessDeniedText}>Нет доступа к аналитике</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#2563EB',
  },
  periodButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  periodButtonTextActive: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 120,
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  accessDeniedText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statChange: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  mastersRanking: {
    gap: 12,
  },
  masterRankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  masterRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  masterRankInfo: {
    flex: 1,
  },
  masterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  masterRankName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginRight: 6,
  },
  masterRankCity: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  masterRankStats: {
    alignItems: 'flex-end',
  },
  masterRankEarnings: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#059669',
    marginBottom: 2,
  },
  masterRankOrders: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  cityStats: {
    gap: 12,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    width: 100,
  },
  cityBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 12,
    position: 'relative',
  },
  cityBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  cityCount: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    width: 50,
    textAlign: 'right',
  },
  categoryStats: {
    gap: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  categoryPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  monthItem: {
    alignItems: 'center',
    flex: 1,
  },
  monthName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
  monthBar: {
    width: 20,
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  monthBarFill: {
    backgroundColor: '#EA580C',
    borderRadius: 10,
    minHeight: 4,
  },
  monthOrders: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  monthEarnings: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statusStats: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  statusCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statusPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  recentOrders: {
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  orderPrice: {
    alignItems: 'flex-end',
  },
  orderPriceText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#059669',
  },
});