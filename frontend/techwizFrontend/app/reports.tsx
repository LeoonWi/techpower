import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ArrowLeft, FileText, Calendar, DollarSign, TrendingUp, Download, Filter, ChartBar as BarChart3 } from 'lucide-react-native';

export default function ReportsScreen() {
  const { user } = useAuth();
  const { orders, analytics } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('earnings');

  if (user?.status !== 'admin' && user?.status !== 'master') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Нет доступа к отчетам</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
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

  const reportTypes = [
    { key: 'earnings', label: 'Доходы', icon: DollarSign },
    { key: 'orders', label: 'Заказы', icon: FileText },
    { key: 'performance', label: 'Эффективность', icon: TrendingUp },
    { key: 'analytics', label: 'Аналитика', icon: BarChart3 },
  ];

  const generateReport = () => {
    Alert.alert(
      'Отчет сгенерирован',
      `Отчет по ${reportTypes.find(r => r.key === reportType)?.label.toLowerCase()} за ${periods.find(p => p.key === selectedPeriod)?.label.toLowerCase()} готов к скачиванию`,
      [{ text: 'OK' }]
    );
  };

  const getReportData = () => {
    switch (reportType) {
      case 'earnings':
        return {
          title: 'Отчет по доходам',
          data: [
            { label: 'Общий доход', value: `${analytics.earnings.toLocaleString('ru-RU')} ₽` },
            { label: 'Комиссия', value: `${analytics.commission.toLocaleString('ru-RU')} ₽` },
            { label: 'Чистый доход', value: `${(analytics.earnings - analytics.commission).toLocaleString('ru-RU')} ₽` },
            { label: 'Средний чек', value: `${Math.round(analytics.earnings / analytics.totalOrders).toLocaleString('ru-RU')} ₽` },
          ]
        };
      case 'orders':
        return {
          title: 'Отчет по заказам',
          data: [
            { label: 'Всего заказов', value: analytics.totalOrders.toString() },
            { label: 'Выполнено', value: analytics.completedOrders.toString() },
            { label: 'В работе', value: (analytics.totalOrders - analytics.completedOrders).toString() },
            { label: 'Процент выполнения', value: `${Math.round((analytics.completedOrders / analytics.totalOrders) * 100)}%` },
          ]
        };
      case 'performance':
        return {
          title: 'Отчет по эффективности',
          data: [
            { label: 'Средний рейтинг', value: analytics.averageRating.toString() },
            { label: 'Заказов в день', value: Math.round(analytics.totalOrders / 30).toString() },
            { label: 'Доход в день', value: `${Math.round(analytics.earnings / 30).toLocaleString('ru-RU')} ₽` },
            { label: 'Активных мастеров', value: '12' },
          ]
        };
      default:
        return {
          title: 'Аналитический отчет',
          data: [
            { label: 'Топ город', value: Object.keys(analytics.ordersByCity)[0] },
            { label: 'Топ категория', value: Object.keys(analytics.ordersByCategory)[0] },
            { label: 'Рост за месяц', value: '+15%' },
            { label: 'Конверсия', value: '85%' },
          ]
        };
    }
  };

  const reportData = getReportData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Отчеты</Text>
        <TouchableOpacity style={styles.headerButton} onPress={generateReport}>
          <Download size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Период</Text>
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

        {/* Report Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Тип отчета</Text>
          <View style={styles.reportTypeGrid}>
            {reportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.reportTypeCard,
                    reportType === type.key && styles.reportTypeCardActive
                  ]}
                  onPress={() => setReportType(type.key)}
                >
                  <IconComponent 
                    size={24} 
                    color={reportType === type.key ? '#2563EB' : '#64748B'} 
                  />
                  <Text style={[
                    styles.reportTypeText,
                    reportType === type.key && styles.reportTypeTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Report Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{reportData.title}</Text>
          <View style={styles.reportPreview}>
            {reportData.data.map((item, index) => (
              <View key={index} style={styles.reportItem}>
                <Text style={styles.reportItemLabel}>{item.label}</Text>
                <Text style={styles.reportItemValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Charts Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Графики</Text>
          <View style={styles.chartsContainer}>
            <View style={styles.chartPlaceholder}>
              <BarChart3 size={48} color="#64748B" />
              <Text style={styles.chartPlaceholderText}>График доходов</Text>
            </View>
            <View style={styles.chartPlaceholder}>
              <TrendingUp size={48} color="#64748B" />
              <Text style={styles.chartPlaceholderText}>Динамика заказов</Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Экспорт</Text>
          <View style={styles.exportOptions}>
            <TouchableOpacity style={styles.exportButton} onPress={generateReport}>
              <FileText size={20} color="#2563EB" />
              <Text style={styles.exportButtonText}>PDF отчет</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} onPress={generateReport}>
              <Download size={20} color="#059669" />
              <Text style={styles.exportButtonText}>Excel таблица</Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  periodButtonTextActive: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
  reportTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportTypeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  reportTypeCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F7FF',
  },
  reportTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  reportTypeTextActive: {
    color: '#2563EB',
    fontFamily: 'Inter-SemiBold',
  },
  reportPreview: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reportItemLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  reportItemValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  chartsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  chartPlaceholder: {
    flex: 1,
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartPlaceholderText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  exportOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  exportButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
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
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});