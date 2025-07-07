// =========================
// Интеграция с backend (заказы):
// - Для создания заказа используйте POST-запрос на /request/create с объектом заказа (Request).
// - Для получения заказов реализуйте GET-запрос (если появится на backend).
// - Для обновления/удаления заказов реализуйте соответствующие endpoint'ы (если появятся).
// - Структура заказа должна соответствовать модели Request из backend.
// - После успешных операций обновляйте локальное состояние.
// - Обрабатывайте ошибки backend.
// =========================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import OrderCard from '@/components/OrderCard';
import { Search, Filter, Plus, User, X } from 'lucide-react-native';
import { OrderStatus } from '@/types/order';
import { Picker } from '@react-native-picker/picker';

const statusFilters = [
  { key: 'all', label: 'Все' },
  { key: 'pending', label: 'Ожидают' },
  { key: 'assigned', label: 'Назначены' },
  { key: 'in_progress', label: 'В работе' },
  { key: 'completed', label: 'Выполнены' },
];

const categories = [
  { id: '1', name: 'Компьютеры' },
  { id: '2', name: 'Электроника' },
  { id: '3', name: 'Мобильные устройства' },
  { id: '4', name: 'Ремонт техники' },
];

export default function OrdersScreen() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, assignOrder, createOrder, deleteOrder, masters } = useData();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMasterSelection, setShowMasterSelection] = useState<string | null>(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [newOrder, setNewOrder] = useState({
    name: '',
    phone_number: '',
    address: '',
    comment: '',
    price: '',
    category_id: '',
    date_time: '',
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || order.status === selectedFilter;

    const roleFilter = () => {
      switch (user?.role) {
        case 'admin':
          return true;
        case 'support':
          return true;
        case 'master':
          return order.assignedMasterId === user.id;
        default:
          return false;
      }
    };

    return matchesSearch && matchesFilter && roleFilter();
  });

  const handleAssignOrder = (orderId: string, masterId?: string) => {
    if (user?.role === 'support' || user?.role === 'admin') {
      if (masterId) {
        assignOrder(orderId, masterId);
        setShowMasterSelection(null);
        Alert.alert('Успешно', 'Заказ назначен мастеру');
      } else {
        setShowMasterSelection(orderId);
      }
    }
  };

  const handleAddOrder = async () => {
    try {
      await createOrder({
        title: newOrder.comment || 'Новый заказ',
        clientName: newOrder.name,
        clientPhone: newOrder.phone_number,
        address: newOrder.address,
        description: newOrder.comment,
        price: Number(newOrder.price),
        category: newOrder.category_id,
        city: '',
        coordinates: { latitude: 0, longitude: 0 },
        commission: 0,
        status: 'pending',
        assignedMasterId: undefined,
        createdAt: new Date(newOrder.date_time),
        updatedAt: new Date(newOrder.date_time),
        isPremium: false,
      });
      Alert.alert('Успешно', 'Заказ создан');
      setShowAddOrderModal(false);
      setNewOrder({ name: '', phone_number: '', address: '', comment: '', price: '', category_id: '', date_time: '' });
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось создать заказ');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (cancelReason.trim()) {
      try {
        await deleteOrder(orderId);
        Alert.alert('Успешно', 'Заказ отменён');
        setShowCancelModal(null);
        setCancelReason('');
      } catch (e) {
        Alert.alert('Ошибка', 'Не удалось отменить заказ');
      }
    } else {
      Alert.alert('Ошибка', 'Укажите причину отмены');
    }
  };

  const canShowActions = user?.role === 'master';
  const canAssignOrders = user?.role === 'support' || user?.role === 'admin';
  const canManageOrders = user?.role === 'support' || user?.role === 'admin';

  const availableMasters = masters.filter(master => 
    master.isActive && master.role === 'master'
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {user?.role === 'support' ? 'Назначение заказов' : 'Заказы'}
        </Text>
        {canManageOrders && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddOrderModal(true)}>
            <Plus size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск заказов..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.filterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView 
        style={styles.ordersList}
        contentContainerStyle={styles.ordersListContent}
        showsVerticalScrollIndicator={true}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Заказы не найдены</Text>
            <Text style={styles.emptyStateSubtext}>
              Попробуйте изменить фильтры или поисковый запрос
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderItemContainer}>
              <OrderCard
                order={order}
                showActions={canShowActions}
                onStatusChange={updateOrderStatus}
                onPress={() => {
                  if (canAssignOrders && order.status === 'pending') {
                    handleAssignOrder(order.id);
                  }
                }}
              />
              
              {/* Support assignment and cancel buttons */}
              <View style={styles.orderActions}>
                {canAssignOrders && order.status === 'pending' && (
                  <TouchableOpacity 
                    style={styles.assignButton}
                    onPress={() => handleAssignOrder(order.id)}
                  >
                    <User size={16} color="white" />
                    <Text style={styles.assignButtonText}>Назначить мастера</Text>
                  </TouchableOpacity>
                )}
                {canManageOrders && order.status !== 'completed' && (
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowCancelModal(order.id)}
                  >
                    <Text style={styles.cancelButtonText}>Отменить</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Order Modal */}
      <Modal
        visible={showAddOrderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Создать новый заказ</Text>
            <ScrollView 
              style={styles.formContainer}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Имя клиента</Text>
                <TextInput
                  style={styles.formInput}
                  value={newOrder.name}
                  onChangeText={(text) => setNewOrder({ ...newOrder, name: text })}
                  placeholder="Введите имя"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Номер телефона</Text>
                <TextInput
                  style={styles.formInput}
                  value={newOrder.phone_number}
                  onChangeText={(text) => setNewOrder({ ...newOrder, phone_number: text })}
                  placeholder="Введите номер телефона"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Адрес</Text>
                <TextInput
                  style={styles.formInput}
                  value={newOrder.address}
                  onChangeText={(text) => setNewOrder({ ...newOrder, address: text })}
                  placeholder="Введите адрес"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Комментарий</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  value={newOrder.comment}
                  onChangeText={(text) => setNewOrder({ ...newOrder, comment: text })}
                  placeholder="Введите комментарий"
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Цена</Text>
                <TextInput
                  style={styles.formInput}
                  value={newOrder.price}
                  onChangeText={(text) => setNewOrder({ ...newOrder, price: text })}
                  placeholder="Введите цену"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Категория</Text>
                <Picker
                  selectedValue={newOrder.category_id}
                  onValueChange={(itemValue) => setNewOrder({ ...newOrder, category_id: itemValue })}
                  style={styles.formPicker}
                >
                  <Picker.Item label="Выберите категорию" value="" />
                  {categories.map((category) => (
                    <Picker.Item key={category.id} label={category.name} value={category.id} />
                  ))}
                </Picker>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Дата и время</Text>
                <TextInput
                  style={styles.formInput}
                  value={newOrder.date_time}
                  onChangeText={(text) => setNewOrder({ ...newOrder, date_time: text })}
                  placeholder="Введите дату и время"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddOrderModal(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddOrder}
              >
                <Text style={styles.submitButtonText}>Создать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={!!showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Отменить заказ?</Text>
            <Text style={styles.cancelConfirmText}>
              Укажите причину отмены заказа:
            </Text>
            <TextInput
              style={[styles.formInput, styles.multilineInput]}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Введите причину отмены"
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowCancelModal(null);
                  setCancelReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteConfirmButton}
                onPress={() => handleCancelOrder(showCancelModal!)}
              >
                <Text style={styles.deleteConfirmButtonText}>Отменить заказ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Master Selection Modal */}
      {showMasterSelection && (
        <Modal
          visible={!!showMasterSelection}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMasterSelection(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Выберите мастера</Text>
              <ScrollView 
                style={styles.mastersList}
                contentContainerStyle={styles.mastersListContent}
                showsVerticalScrollIndicator={true}
              >
                {availableMasters.length === 0 ? (
                  <View style={styles.emptyMastersState}>
                    <Text style={styles.emptyMastersText}>Нет доступных мастеров</Text>
                    <Text style={styles.emptyMastersSubtext}>
                      Все мастера либо неактивны, либо уже заняты
                    </Text>
                  </View>
                ) : (
                  availableMasters.map((master) => (
                    <TouchableOpacity
                      key={master.id}
                      style={styles.masterItem}
                      onPress={() => handleAssignOrder(showMasterSelection, master.id)}
                    >
                      <View style={styles.masterInfo}>
                        <Text style={styles.masterName}>{master.fullName}</Text>
                        <Text style={styles.masterCategory}>{master.category}</Text>
                        <Text style={styles.masterCity}>{master.city}</Text>
                      </View>
                      <View style={styles.masterStats}>
                        <Text style={styles.masterRating}>⭐ 4.8</Text>
                        <Text style={styles.masterOrders}>24 заказа</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowMasterSelection(null)}
                >
                  <Text style={styles.cancelButtonText}>Отмена</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 80, // Added to account for potential bottom navigation bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  filterButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersContainer: {
    marginBottom: 0,
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 4,
  },
  filterChip: {
    height: 32,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  filterChipTextActive: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ordersListContent: {
    paddingBottom: 120, // Added to ensure last order is fully visible
    flexGrow: 1,
  },
  orderItemContainer: {
    marginBottom: 16,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 0,
    marginTop: -8,
    gap: 8,
  },
  assignButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
  },
  assignButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 120, // Added to ensure full scrolling in modal
    flexGrow: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  deleteConfirmText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  mastersList: {
    flex: 1,
  },
  mastersListContent: {
    paddingBottom: 120, // Added to ensure full scrolling in modal
    flexGrow: 1,
  },
  masterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  masterInfo: {
    flex: 1,
  },
  masterName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  masterRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  masterCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    marginBottom: 2,
  },
  masterCity: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  masterStats: {
    alignItems: 'flex-end',
  },
  masterRating: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginBottom: 2,
  },
  masterOrders: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  cancelButtonIcon: {
    marginLeft: 6,
  },
  formPicker: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  cancelConfirmText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyMastersState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyMastersText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMastersSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
});