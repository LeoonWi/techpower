import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ChartBar as BarChart3, TrendingUp, Users, DollarSign, Calendar, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { analytics } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  if (user?.role !== 'admin' && user?.role !== 'senior_master') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Нет доступа к аналитике</Text>
        </View>
      </SafeAreaView>
    );
  }

  const periods = [
    { key: 'week', label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
    { key: 'quarter', label: 'Квартал' },
    { key: 'year', label: 'Год' },
  ];

  const stats = [
    {
      title: 'Всего заказов',
      value: analytics.totalOrders,
      icon: BarChart3,
      color: '#2563EB',
      change: '+12%',
    },
    {
      title: 'Выполнено',
      value: analytics.completedOrders,
      icon: TrendingUp,
      color: '#10B981',
      change: '+8%',
    },
    {
      title: 'Общий доход',
      value: `${analytics.earnings.toLocaleString('ru-RU')} ₽`,
      icon: DollarSign,
      color: '#F59E0B',
      change: '+15%',
    },
    {
      title: 'Комиссия',
      value: `${analytics.commission.toLocaleString('ru-RU')} ₽`,
      icon: Users,
      color: '#7C3AED',
      change: '+10%',
    },
  ];

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
              onPress={() => setSelectedPeriod(period.key)}
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
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

        {/* Orders by City */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <MapPin size={20} color="#2563EB" />
            <Text style={styles.chartTitle}>Заказы по городам</Text>
          </View>
          <View style={styles.cityStats}>
            {Object.entries(analytics.ordersByCity).map(([city, count]) => (
              <View key={city} style={styles.cityRow}>
                <Text style={styles.cityName}>{city}</Text>
                <View style={styles.cityBar}>
                  <View 
                    style={[
                      styles.cityBarFill, 
                      { width: `${(count / Math.max(...Object.values(analytics.ordersByCity))) * 100}%` }
                    ]} 
                  />
                  <Text style={styles.cityCount}>{count}</Text>
                </View>
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
            {Object.entries(analytics.ordersByCategory).map(([category, count]) => (
              <View key={category} style={styles.categoryItem}>
                <View style={styles.categoryDot} />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryCount}>{count} заказов</Text>
                </View>
                <Text style={styles.categoryPercentage}>
                  {Math.round((count / analytics.totalOrders) * 100)}%
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
            {analytics.monthlyStats.map((month, index) => (
              <View key={index} style={styles.monthItem}>
                <Text style={styles.monthName}>{month.month}</Text>
                <View style={styles.monthBar}>
                  <View 
                    style={[
                      styles.monthBarFill,
                      { 
                        height: `${(month.orders / Math.max(...analytics.monthlyStats.map(m => m.orders))) * 100}%` 
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
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
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
    marginLeft: 'auto',
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
});