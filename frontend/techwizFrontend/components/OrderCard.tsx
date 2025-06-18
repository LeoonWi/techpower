import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Order, OrderStatus } from '@/types/order';
import { MapPin, Clock, DollarSign, Crown } from 'lucide-react-native';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  showActions?: boolean;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
}

export default function OrderCard({ order, onPress, showActions, onStatusChange }: OrderCardProps) {
  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: '#F59E0B',
      assigned: '#2563EB',
      in_progress: '#059669',
      completed: '#10B981',
      cancelled: '#EF4444',
      rejected: '#DC2626',
      modernization: '#7C3AED',
    };
    return colors[status] || '#64748B';
  };

  const getStatusText = (status: OrderStatus) => {
    const texts = {
      pending: 'Ожидает',
      assigned: 'Назначен',
      in_progress: 'В работе',
      completed: 'Выполнен',
      cancelled: 'Отменен',
      rejected: 'Отказ',
      modernization: 'Модернизация',
    };
    return texts[status] || status;
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/order/${order.id}`);
    }
  };

  const statusActions = [
    { status: 'completed' as OrderStatus, title: 'Сдать', color: '#10B981' },
    { status: 'modernization' as OrderStatus, title: 'Модернизация', color: '#7C3AED' },
    { status: 'cancelled' as OrderStatus, title: 'Отмена', color: '#F59E0B' },
    { status: 'rejected' as OrderStatus, title: 'Отказ', color: '#EF4444' },
  ];

  return (
    <TouchableOpacity style={styles.container} onPress={handleCardPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{order.title}</Text>
          {order.isPremium && (
            <Crown size={16} color="#FFD700" style={styles.premiumIcon} />
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {order.description}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <MapPin size={14} color="#64748B" />
          <Text style={styles.infoText}>{order.city}</Text>
        </View>
        <View style={styles.infoItem}>
          <DollarSign size={14} color="#64748B" />
          <Text style={styles.infoText}>{order.price.toLocaleString('ru-RU')} ₽</Text>
        </View>
        <View style={styles.infoItem}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.infoText}>
            {order.createdAt.toLocaleDateString('ru-RU')}
          </Text>
        </View>
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{order.clientName}</Text>
        <Text style={styles.clientPhone}>{order.clientPhone}</Text>
      </View>

      {showActions && order.status === 'assigned' && (
        <View style={styles.actionsContainer}>
          {statusActions.map((action) => (
            <TouchableOpacity
              key={action.status}
              style={[styles.actionButton, { backgroundColor: `${action.color}20` }]}
              onPress={(e) => {
                e.stopPropagation();
                onStatusChange?.(order.id, action.status);
              }}
            >
              <Text style={[styles.actionText, { color: action.color }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  premiumIcon: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 4,
  },
  clientInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  clientName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
});