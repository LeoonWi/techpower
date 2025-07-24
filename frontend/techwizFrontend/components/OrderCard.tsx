import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Order, OrderStatus } from '@/types/order';
import { MapPin, Clock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  showActions?: boolean;
  onStatusChange?: (orderId: string, status: OrderStatus, reason?: string, price_is_bail?: number) => void;
  onCancel?: (orderId: string, reason: string) => void;
}

export default function OrderCard({ order, onPress, showActions, onStatusChange, onCancel }: OrderCardProps) {
  const { user } = useAuth();
  const [showClientInfo, setShowClientInfo] = useState(false);
  const [showModernizationForm, setShowModernizationForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [modernizationReason, setModernizationReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionAmount, setRejectionAmount] = useState('');
  // --- new state for price modal ---
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completePrice, setCompletePrice] = useState(order.price ? String(order.price) : '');
  const [completeComment, setCompleteComment] = useState(''); // только для фронта

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

  const handleOnSite = () => {
    setShowClientInfo(true);
    onStatusChange?.(order.id, 'in_progress');
  };

  const handleModernization = () => {
    setShowModernizationForm(true);
  };

  const handleRejection = () => {
    setShowRejectionForm(true);
  };

  const submitModernization = () => {
    if (modernizationReason.trim()) {
      onStatusChange?.(order.id, 'modernization', modernizationReason);
      setShowModernizationForm(false);
      setModernizationReason('');
    }
  };

  const submitRejection = () => {
    if (rejectionReason.trim() && rejectionAmount.trim()) {
      onStatusChange?.(order.id, 'rejected', rejectionReason, Number(rejectionAmount));
      setShowRejectionForm(false);
      setRejectionReason('');
      setRejectionAmount('');
    }
  };

  const statusActions = [
    { status: 'completed' as OrderStatus, title: 'Сдать', color: '#10B981', action: () => setShowCompleteModal(true) },
    { status: 'modernization' as OrderStatus, title: 'Модернизация', color: '#7C3AED', action: handleModernization },
    { status: 'rejected' as OrderStatus, title: 'Отказ', color: '#EF4444', action: handleRejection },
  ];

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleCardPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{order.title}</Text>
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

      {/* Блок информации: теперь две строки */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoText}>{order.price.toLocaleString('ru-RU')} ₽</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoText}>{order.clientPhone}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <MapPin size={14} color="#64748B" />
          <Text style={styles.infoText}>{order.city}</Text>
        </View>
        <View style={styles.infoItem}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.infoText}>{formatDateTime(order.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{order.clientName}</Text>
        <Text style={styles.clientAddress}>{order.address}</Text>
      </View>

      {showActions && (order.status === 'assigned' || order.status === 'in_progress') && (
        <View style={styles.actionsContainer}>
          {user?.role === 'master' && order.status === 'assigned' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2563EB20' }]}
              onPress={(e) => {
                e.stopPropagation();
                handleOnSite();
              }}
            >
              <Text style={[styles.actionText, { color: '#2563EB' }]}>
                На месте
              </Text>
            </TouchableOpacity>
          )}
          {statusActions.map((action) => (
            <TouchableOpacity
              key={action.status}
              style={[styles.actionButton, { backgroundColor: `${action.color}20` }]}
              onPress={(e) => {
                e.stopPropagation();
                if (action.action) {
                  action.action();
                } else {
                  onStatusChange?.(order.id, action.status);
                }
              }}
            >
              <Text style={[styles.actionText, { color: action.color }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Модальное окно модернизации */}
      <Modal
        visible={showModernizationForm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModernizationForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Модернизация заказа</Text>
            <Text style={styles.modalSubtitle}>
              Укажите причину модернизации и приложите фото (макс. 5 шт.)
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Причина модернизации..."
              value={modernizationReason}
              onChangeText={setModernizationReason}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowModernizationForm(false)}
              >
                <Text style={styles.modalCancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitButton, !modernizationReason.trim() && styles.modalSubmitButtonDisabled]}
                onPress={submitModernization}
                disabled={!modernizationReason.trim()}
              >
                <Text style={styles.modalSubmitButtonText}>Подтвердить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно отказа */}
      <Modal
        visible={showRejectionForm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRejectionForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Отказ от заказа</Text>
            <Text style={styles.modalSubtitle}>
              Укажите причину отказа и сумму за выезд
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Причина отказа..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Сумма за выезд (₽)"
              value={rejectionAmount}
              onChangeText={setRejectionAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowRejectionForm(false)}
              >
                <Text style={styles.modalCancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitButton, (!rejectionReason.trim() || !rejectionAmount.trim()) && styles.modalSubmitButtonDisabled]}
                onPress={submitRejection}
                disabled={!rejectionReason.trim() || !rejectionAmount.trim()}
              >
                <Text style={styles.modalSubmitButtonText}>Подтвердить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Модальное окно сдачи заказа (указание цены и комментария) --- */}
      <Modal
        visible={showCompleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Сдать заказ</Text>
            <Text style={styles.modalSubtitle}>Укажите итоговую цену заказа и комментарий (только для себя)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Цена заказа (₽)"
              value={completePrice}
              onChangeText={setCompletePrice}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.modalInput, { height: 80, marginTop: 8 }]}
              placeholder="Комментарий (только для вас, не отправляется)"
              value={completeComment}
              onChangeText={setCompleteComment}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCompleteModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, (!completePrice.trim() || isNaN(Number(completePrice))) && styles.modalSubmitButtonDisabled]}
                onPress={() => {
                  if (!completePrice.trim() || isNaN(Number(completePrice))) return;
                  setShowCompleteModal(false);
                  // Сохраняем комментарий только локально (можно добавить в localStorage или state, если нужно)
                  // Отправляем только цену и статус
                  onStatusChange?.(order.id, 'completed', undefined, Number(completePrice));
                }}
                disabled={!completePrice.trim() || isNaN(Number(completePrice))}
              >
                <Text style={styles.modalSubmitButtonText}>Сдать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 0,
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
    marginBottom: 12,
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
    marginBottom: 4,
  },
  clientAddress: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#059669',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  modalSubmitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});