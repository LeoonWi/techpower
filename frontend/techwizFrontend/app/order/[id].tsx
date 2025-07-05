import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ArrowLeft, MapPin, Phone, User, Clock, DollarSign, Crown, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, Settings } from 'lucide-react-native';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { orders, updateOrderStatus } = useData();
  const [isUpdating, setIsUpdating] = useState(false);

  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Заказ не найден</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#F59E0B',
      assigned: '#2563EB',
      in_progress: '#059669',
      completed: '#10B981',
      cancelled: '#EF4444',
      rejected: '#DC2626',
      modernization: '#7C3AED',
    };
    return colors[status as keyof typeof colors] || '#64748B';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Ожидает назначения',
      assigned: 'Назначен мастеру',
      in_progress: 'В работе',
      completed: 'Выполнен',
      cancelled: 'Отменен',
      rejected: 'Отклонен',
      modernization: 'Модернизация',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      updateOrderStatus(order.id, newStatus as any);
      Alert.alert('Успешно', 'Статус заказа обновлен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить статус');
    } finally {
      setIsUpdating(false);
    }
  };

  const canUpdateStatus = user?.role === 'master' || user?.role === 'senior_master' || user?.role === 'premium_master';

  const statusActions = [
    { status: 'in_progress', title: 'Начать работу', icon: Clock, color: '#059669' },
    { status: 'completed', title: 'Завершить', icon: CheckCircle, color: '#10B981' },
    { status: 'modernization', title: 'Модернизация', icon: Settings, color: '#7C3AED' },
    { status: 'cancelled', title: 'Отменить', icon: XCircle, color: '#F59E0B' },
    { status: 'rejected', title: 'Отклонить', icon: AlertCircle, color: '#EF4444' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Детали заказа</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Request Header */}
        <View style={styles.orderHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.orderTitle}>{order.title}</Text>
            {order.isPremium && <Crown size={20} color="#FFD700" />}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>

        {/* Request Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.orderImage}
            resizeMode="cover"
          />
        </View>

        {/* Request Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>{order.description}</Text>
        </View>

        {/* Request Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Детали заказа</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <DollarSign size={20} color="#059669" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Стоимость</Text>
                <Text style={styles.detailValue}>{order.price.toLocaleString('ru-RU')} ₽</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <MapPin size={20} color="#2563EB" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Адрес</Text>
                <Text style={styles.detailValue}>{order.address}</Text>
                <Text style={styles.detailSubvalue}>{order.city}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Clock size={20} color="#F59E0B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Создан</Text>
                <Text style={styles.detailValue}>
                  {order.createdAt.toLocaleDateString('ru-RU')}
                </Text>
                <Text style={styles.detailSubvalue}>
                  {order.createdAt.toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация о клиенте</Text>
          <View style={styles.clientCard}>
            <View style={styles.clientHeader}>
              <View style={styles.clientAvatar}>
                <User size={24} color="#64748B" />
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{order.clientName}</Text>
                <Text style={styles.clientPhone}>{order.clientPhone}</Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Phone size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Status Actions */}
        {canUpdateStatus && order.status === 'assigned' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Действия</Text>
            <View style={styles.actionsGrid}>
              {statusActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <TouchableOpacity
                    key={action.status}
                    style={[styles.actionButton, { borderColor: action.color }]}
                    onPress={() => handleStatusUpdate(action.status)}
                    disabled={isUpdating}
                  >
                    <IconComponent size={20} color={action.color} />
                    <Text style={[styles.actionText, { color: action.color }]}>
                      {action.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Commission Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Финансовая информация</Text>
          <View style={styles.financeCard}>
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Стоимость заказа:</Text>
              <Text style={styles.financeValue}>{order.price.toLocaleString('ru-RU')} ₽</Text>
            </View>
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Комиссия ({user?.commission}%):</Text>
              <Text style={styles.financeCommission}>
                {order.commission.toLocaleString('ru-RU')} ₽
              </Text>
            </View>
            <View style={[styles.financeRow, styles.financeTotal]}>
              <Text style={styles.financeTotalLabel}>К получению:</Text>
              <Text style={styles.financeTotalValue}>
                {(order.price - order.commission).toLocaleString('ru-RU')} ₽
              </Text>
            </View>
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
  orderHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  imageContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 24,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  detailSubvalue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  clientCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  callButton: {
    backgroundColor: '#059669',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'white',
    minWidth: '45%',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  financeCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  financeTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: 0,
  },
  financeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  financeValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  financeCommission: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  financeTotalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  financeTotalValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#059669',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
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