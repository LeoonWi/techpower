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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, X, Edit, Trash2, UserCheck, ArrowLeft } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers } from '../data/users';
import { UserRole, User } from '../types/user';

export default function AddEmployeeScreen() {
  const { user, registerUser } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('support');

  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    setName('');
    setPhone('');
    setPassword('');
    setRole('support');
  };

  const openActionModal = (employee: User) => {
    setSelectedEmployee(employee);
    setActionModalVisible(true);
  };

  const closeActionModal = () => {
    setActionModalVisible(false);
    setSelectedEmployee(null);
  };

  const loadEmployees = async () => {
    const users = getUsers();
    setEmployees(users.map(u => ({
      id: u.id,
      role: u.role,
      fullName: u.fullName || '',
      nickname: '',
      phone: u.phone,
      city: '',
      category: '',
      balance: 0,
      commission: 0,
      isActive: true,
    })));
  };

  const addEmployee = async () => {
    if (name.trim() && phone.trim() && password.trim()) {
      try {
        const success = await registerUser({
          phone,
          password,
          role,
          fullName: name,
        });
        if (success) {
          await loadEmployees();
          closeModal();
          Alert.alert('Успех', 'Сотрудник добавлен');
        } else {
          Alert.alert('Ошибка', 'Пользователь с таким номером уже существует');
        }
      } catch (e) {
        Alert.alert('Ошибка', 'Не удалось добавить сотрудника');
      }
    } else {
      Alert.alert('Ошибка', 'Заполните все поля');
    }
  };

  const changeEmployeeStatus = () => {
    if (selectedEmployee) {
      const newStatus = selectedEmployee.isActive ? false : true;
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === selectedEmployee.id 
            ? { ...emp, isActive: newStatus }
            : emp
        )
      );
      closeActionModal();
      Alert.alert('Успех', `Статус сотрудника изменен на ${newStatus ? 'активный' : 'неактивный'}`);
    }
  };

  const changeEmployeeRole = async () => {
    if (selectedEmployee) {
      let newRole: UserRole;
      switch (selectedEmployee.role) {
        case 'admin':
          newRole = 'support';
          break;
        case 'support':
          newRole = 'master';
          break;
        case 'master':
          newRole = 'admin';
          break;
        default:
          newRole = 'support';
      }
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === selectedEmployee.id
            ? { ...emp, role: newRole }
            : emp
        )
      );
      await loadEmployees();
      closeActionModal();
      Alert.alert('Успех', `Роль сотрудника изменена на ${getRoleTitle(newRole)}`);
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'master':
        return 'Мастер';
      case 'support':
        return 'Поддержка';
      default:
        return role;
    }
  };

  const getStatusTitle = (status?: boolean) => {
    return status ? 'Активен' : 'Неактивен';
  };

  const filteredEmployees = employees.filter(
    (e) =>
      (e.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.phone || '').includes(searchQuery) ||
      getRoleTitle(e.role).toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <RoleGuard allowedRoles={['admin', 'limitedAdmin']} fallbackRoute="/login">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {user?.role === 'limitedAdmin' ? 'Создание сотрудников' : 'Управление сотрудниками'}
          </Text>
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
          {filteredEmployees.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Сотрудники не найдены</Text>
              <Text style={styles.emptyStateSubtext}>Попробуйте изменить поисковый запрос</Text>
            </View>
          ) : (
            filteredEmployees.map((employee) => (
              <View key={employee.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.employeeName}>{employee.fullName}</Text>
                  <Text style={styles.employeePhone}>{employee.phone}</Text>
                  <View style={styles.employeeDetails}>
                    <Text style={styles.employeeRole}>{getRoleTitle(employee.role)}</Text>
                    <Text style={[styles.employeeStatus, { color: employee.isActive ? '#10B981' : '#EF4444' }]}>
                      {getStatusTitle(employee.isActive)}
                    </Text>
                  </View>
                </View>
                {user?.role !== 'limitedAdmin' && (
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
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Модальное окно добавления сотрудника */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeModal}>
            <Pressable style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Добавить сотрудника</Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>Заполните данные нового сотрудника</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Имя и фамилия"
                value={name}
                onChangeText={setName}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Номер телефона"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Пароль"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <Picker
                selectedValue={role}
                onValueChange={setRole}
                style={styles.picker}
              >
                <Picker.Item label="Администратор" value="admin" />
                <Picker.Item label="Поддержка" value="support" />
                <Picker.Item label="Мастер" value="master" />
              </Picker>
              
              <TouchableOpacity style={styles.modalButton} onPress={addEmployee}>
                <Text style={styles.modalButtonText}>Добавить</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Модальное окно действий с сотрудником */}
        <Modal
          visible={isActionModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeActionModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeActionModal}>
            <Pressable style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Действия с сотрудником</Text>
                <TouchableOpacity onPress={closeActionModal}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>
                {selectedEmployee?.fullName} - {getRoleTitle(selectedEmployee?.role || '')}
              </Text>
              
              {selectedEmployee && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionModalButton, styles.statusButton]} 
                    onPress={changeEmployeeStatus}
                  >
                    <Text style={[styles.actionModalButtonText, { color: '#2563EB' }]}>
                      {selectedEmployee.isActive ? 'Деактивировать' : 'Активировать'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionModalButton, styles.roleButton]} 
                    onPress={changeEmployeeRole}
                  >
                    <Text style={[styles.actionModalButtonText, { color: '#F59E0B' }]}>
                      Изменить роль
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Pressable>
          </Pressable>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
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
    marginTop: 16,
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
  picker: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    height: 40,
    fontSize: 16,
    marginBottom: 8,
    color: '#1E293B',
  },
}); 