import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Request, Status } from '@/types/request';
import { MapPin, Clock, DollarSign, Crown } from 'lucide-react-native';

interface OrderCardProps {
  request: Request;
  onPress?: () => void;
  showActions?: boolean;
  onStatusChange?: (orderId: string | undefined, status: Status | undefined) => void;
}

export default function OrderCard({ request, onPress, showActions, onStatusChange }: OrderCardProps) {
  const getStatusColor = (status: Status | undefined) => {
    const colorMap: Record<number, string> = {
      0: '#F59E0B', // pending
      1: '#2563EB', // assigned
      2: '#059669', // in_progress
      3: '#10B981', // completed
      4: '#EF4444', // cancelled
      5: '#DC2626', // rejected
      6: '#7C3AED', // modernization
    };
    // @ts-ignore
    return colorMap[status.status_code] || '#64748B';
  };

  // @ts-ignore
  const getStatusText = (status: Status | undefined) => status.reason;


  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/order/${request.id}`);
    }
  };

  const statusActions = [
    { status_code: 3, reason: 'completed', color: '#10B981' },
    { status_code: 6, reason: 'modernization', color: '#7C3AED' },
    { status_code: 4, reason: 'cancelled', color: '#F59E0B' },
    { status_code: 5, reason: 'rejected', color: '#EF4444' },
  ];

  return (
    <TouchableOpacity style={styles.container} onPress={handleCardPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{request.full_name}</Text>
          {request.isPremium && (
            <Crown size={16} color="#FFD700" style={styles.premiumIcon} />
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(request.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(request.status)}]}>
            {getStatusText(request.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {request.problem}
      </Text>

      <View style={styles.infoRow}>
        {/*<View style={styles.infoItem}>*/}
        {/*  <MapPin size={14} color="#64748B" />*/}
        {/*  <Text style={styles.infoText}>{order.city}</Text>*/}
        {/*</View>*/}
        <View style={styles.infoItem}>
          <DollarSign size={14} color="#64748B" />
          <Text style={styles.infoText}>{request.price?.toLocaleString('ru-RU')} ₽</Text>
        </View>
        <View style={styles.infoItem}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.infoText}>
            {request.datetime?.toLocaleDateString('ru-RU')}
          </Text>
        </View>
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{request.worker?.full_name}</Text>
        <Text style={styles.clientPhone}>{request.worker?.phone_number}</Text>
      </View>

      {showActions && request.status?.status_code === 1 && (
        <View style={styles.actionsContainer}>
          {statusActions.map((action) => (
            <TouchableOpacity
              key={action.status_code}
              style={[styles.actionButton, { backgroundColor: `${action.color}20` }]}
              onPress={(e) => {
                e.stopPropagation();
                onStatusChange?.(request.id, request.status);
              }}
            >
              <Text style={[styles.actionText, { color: action.color }]}>
                {action.reason}
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