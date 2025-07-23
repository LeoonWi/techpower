import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, X, Edit, Trash2, UserCheck } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import RoleGuard from '@/components/RoleGuard';
import { apiClient, User } from '@/api/client';
import { permissionToRole, roleToPermission, getRoleTitle } from '@/utils/roleUtils';

interface Employee {
  id: string;
  name: string;
  phone: string;
  role: string;
  status?: string;
  masterStatus?: string;
}

export default function EmployeeScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('support');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [isStatusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('default');
  const masterRoles = ['master', 'premium_master', 'senior_master'];


  // Загрузка сотрудников с бэкенда при открытии страницы
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await apiClient.getUsers();
      
      // Преобразуем данные из бэкенда в формат компонента
      const transformedEmployees: Employee[] = users.map((user: User) => {
        return {
          id: user.id, // Используем оригинальный ID из бэкенда
          name: user.full_name || user.nickname || 'Без имени',
          phone: user.phone_number,
          role: permissionToRole(user.permission),
          status: user.dismissed ? 'inactive' : 'active',
          masterStatus: user.status, // предполагаем, что user.status = default|premium|senior для мастеров
        };
      });
      
      setEmployees(transformedEmployees);
    } catch (err) {
      console.error('Ошибка загрузки сотрудников:', err);
      setError('Не удалось загрузить сотрудников');
      // В случае ошибки показываем тестовые данные
      setEmployees([
        { id: '1', name: 'Иван Иванов', phone: '+7 900 123-45-67', role: 'support', status: 'active' },
        { id: '2', name: 'Петр Петров', phone: '+7 900 234-56-78', role: 'master', status: 'active', masterStatus: 'default' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    setName('');
    setPhone('');
    setPassword('');
    setRole('support');
  };

  const openActionModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActionModalVisible(true);
  };

  const closeActionModal = () => {
    setActionModalVisible(false);
    setSelectedEmployee(null);
  };

  const openStatusModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedStatus(employee.status || 'default');
    setStatusModalVisible(true);
  };
  const closeStatusModal = () => {
    setStatusModalVisible(false);
    setSelectedEmployee(null);
  };
  const handleChangeMasterStatus = async () => {
    if (selectedEmployee) {
      try {
        await apiClient.changeMasterStatus(selectedEmployee.id, 'add', selectedStatus);
        await loadEmployees();
        closeStatusModal();
        Alert.alert('Успех', 'Статус мастера изменён');
      } catch (err) {
        console.error('Ошибка изменения статуса мастера:', err);
        Alert.alert('Ошибка', 'Не удалось изменить статус мастера');
      }
    }
  };

  const addEmployee = async () => {
    if (name.trim() && phone.trim() && password.trim()) {
      try {
        setSavingEmployee(true);
        // Создаем нового пользователя через API
        const permission = roleToPermission(role as any);
        await apiClient.signUp({
          phone_number: phone,
          password: password,
          permission: permission,
          full_name: name,
        });
        
        // Перезагружаем список сотрудников
        await loadEmployees();
        closeModal();
        Alert.alert('Успех', 'Сотрудник добавлен');
      } catch (err) {
        console.error('Ошибка добавления сотрудника:', err);
        Alert.alert('Ошибка', 'Не удалось добавить сотрудника');
      } finally {
        setSavingEmployee(false);
      }
    } else {
      Alert.alert('Ошибка', 'Заполните все поля');
    }
  };

  const changeEmployeeStatus = async () => {
    if (selectedEmployee) {
      try {
        // Изменяем статус мастера через API
        const event = selectedEmployee.status === 'active' ? 'remove' : 'add';
        const status = selectedEmployee.status === 'active' ? '' : 'default';
        
        await apiClient.changeMasterStatus(selectedEmployee.id, event, status);
        
        // Перезагружаем список сотрудников
        await loadEmployees();
        closeActionModal();
        Alert.alert('Успех', `Статус сотрудника изменен`);
      } catch (err) {
        console.error('Ошибка изменения статуса:', err);
        Alert.alert('Ошибка', 'Не удалось изменить статус сотрудника');
      }
    }
  };

  const changeEmployeeRole = async () => {
    if (selectedEmployee) {
      try {
        const newRole = selectedEmployee.role === 'master' ? 'support' : 'master';
        const oldPermission = roleToPermission(selectedEmployee.role as any);
        const newPermission = roleToPermission(newRole as any);
        
        await apiClient.changePermission(
          selectedEmployee.id,
          oldPermission,
          newPermission
        );
        
        // Перезагружаем список сотрудников
        await loadEmployees();
        closeActionModal();
        Alert.alert('Успех', `Роль сотрудника изменена на ${getRoleTitle(newRole)}`);
      } catch (err) {
        console.error('Ошибка изменения роли:', err);
        Alert.alert('Ошибка', 'Не удалось изменить роль сотрудника');
      }
    }
  };

  const fireEmployee = () => {
    if (selectedEmployee) {
      Alert.alert(
        'Уволить сотрудника',
        `Вы уверены, что хотите уволить ${selectedEmployee.name}?`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Уволить',
            style: 'destructive',
            onPress: async () => {
              try {
                await apiClient.dismissUser(selectedEmployee.id);
                
                // Перезагружаем список сотрудников
                await loadEmployees();
                closeActionModal();
                Alert.alert('Успех', 'Сотрудник уволен');
              } catch (err) {
                console.error('Ошибка увольнения:', err);
                Alert.alert('Ошибка', 'Не удалось уволить сотрудника');
              }
            }
          }
        ]
      );
    }
  };



  const getStatusTitle = (status?: string) => {
    return status === 'active' ? 'Активен' : 'Неактивен';
  };

  const getMasterStatusTitle = (status?: string) => {
    switch (status) {
      case 'default':
        return 'Обычный мастер';
      case 'premium':
        return 'Премиум мастер';
      case 'senior':
        return 'Старший мастер';
      default:
        return '';
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone.includes(searchQuery) ||
      getRoleTitle(e.role).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['admin']} fallbackRoute="/login">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Сотрудники</Text>
          <TouchableOpacity style={styles.addButton} onPress={openModal}>
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

      {/* Поиск */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск сотрудников..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Список сотрудников */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Загрузка сотрудников...</Text>
          </View>
                 ) : error ? (
           <View style={styles.errorContainer}>
             <Text style={styles.errorText}>{error}</Text>
             <Text style={styles.errorSubtext}>Попробуйте перезагрузить список</Text>
             <TouchableOpacity style={styles.retryButton} onPress={loadEmployees}>
               <Text style={styles.retryButtonText}>Обновить</Text>
             </TouchableOpacity>
           </View>
        ) : filteredEmployees.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Сотрудники не найдены</Text>
            <Text style={styles.emptyStateSubtext}>Попробуйте изменить поисковый запрос</Text>
          </View>
        ) : (
          filteredEmployees.map((employee) => (
            <View key={employee.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.employeeName}>{employee.name}</Text>
                <Text style={styles.employeePhone}>{employee.phone}</Text>
                <View style={styles.employeeDetails}>
                  <Text style={styles.employeeRole}>{getRoleTitle(employee.role)}</Text>
                  {masterRoles.includes(employee.role) && employee.masterStatus && (
                    <Text style={[styles.employeeStatus, { color: '#2563EB', backgroundColor: '#EFF6FF' }]}> 
                      {getMasterStatusTitle(employee.masterStatus)}
                    </Text>
                  )}
                  <Text style={[styles.employeeStatus, { color: employee.status === 'active' ? '#10B981' : '#EF4444' }]}> 
                    {getStatusTitle(employee.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                {employee.role === 'master' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.statusButton]} 
                    onPress={() => openActionModal(employee)}
                  >
                    <UserCheck size={16} color="#2563EB" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.actionButton, styles.roleButton]} 
                  onPress={() => openActionModal(employee)}
                >
                  <Edit size={16} color="#F59E0B" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.fireButton]} 
                  onPress={() => openActionModal(employee)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Модальное окно добавления сотрудника */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Добавить сотрудника</Text>
              <Pressable onPress={closeModal}>
                <X size={24} color="#334155" />
              </Pressable>
            </View>

            <TextInput
              placeholder="Имя"
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              placeholder="Номер телефона"
              style={styles.modalInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            
            <TextInput
              placeholder="Пароль"
              style={styles.modalInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Поддержка" value="support" />
                <Picker.Item label="Мастер" value="master" />
              </Picker>
            </View>

            <TouchableOpacity 
              style={[styles.modalButton, savingEmployee && styles.modalButtonDisabled]} 
              onPress={addEmployee}
              disabled={savingEmployee}
            >
              {savingEmployee ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Сохранить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Модальное окно действий */}
      <Modal visible={isActionModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Управление сотрудником</Text>
              <Pressable onPress={closeActionModal}>
                <X size={24} color="#334155" />
              </Pressable>
            </View>

            {selectedEmployee && (
              <>
                <Text style={styles.modalSubtitle}>{selectedEmployee.name}</Text>
                
                {masterRoles.includes(selectedEmployee?.role || '') && (
                  <TouchableOpacity style={[styles.actionModalButton, styles.statusButton]} onPress={() => openStatusModal(selectedEmployee)}>
                    <Text style={styles.actionModalButtonText}>
                      Изменить статус мастера
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={[styles.actionModalButton, styles.roleButton]} onPress={changeEmployeeRole}>
                  <Text style={styles.actionModalButtonText}>
                    Изменить роль
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionModalButton, styles.fireButton]} onPress={fireEmployee}>
                  <Text style={styles.actionModalButtonText}>
                    Уволить
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Модальное окно смены статуса мастера */}
      <Modal visible={isStatusModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Сменить статус мастера</Text>
              <Pressable onPress={closeStatusModal}>
                <X size={24} color="#334155" />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>{selectedEmployee?.name}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={setSelectedStatus}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Обычный мастер" value="default" />
                <Picker.Item label="Премиум мастер" value="premium" />
                <Picker.Item label="Старший мастер" value="senior" />
              </Picker>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={handleChangeMasterStatus}>
              <Text style={styles.modalButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </RoleGuard>
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
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
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
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  employeePhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  employeeDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  employeeRole: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  employeeStatus: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  modalButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  actionModalButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionModalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  statusButton: {
    backgroundColor: '#EFF6FF',
  },
  roleButton: {
    backgroundColor: '#FEF3C7',
  },
  fireButton: {
    backgroundColor: '#FEE2E2',
  },
  pickerContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1E293B',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  pickerItem: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});
