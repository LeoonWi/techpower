import React, { useState } from 'react';
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
import { Plus, Search, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

interface Employee {
  id: number;
  name: string;
  position: string;
}

export default function EmployeeScreen() {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: 'Иван Иванов', position: 'Менеджер' },
    { id: 2, name: 'Петр Петров', position: 'Разработчик' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Саппорт');


  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    setName('');
    setPosition('');
  };

  const addEmployee = () => {
    if (name.trim() && position.trim()) {
      const newEmployee: Employee = {
        id: Date.now(),
        name,
        position,
      };
      setEmployees((prev) => [...prev, newEmployee]);
      closeModal();
    } else {
      Alert.alert('Ошибка', 'Заполните все поля');
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
        {filteredEmployees.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Сотрудники не найдены</Text>
            <Text style={styles.emptyStateSubtext}>Попробуйте изменить поисковый запрос</Text>
          </View>
        ) : (
          filteredEmployees.map((employee) => (
            <View key={employee.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.employeeName}>{employee.name}</Text>
                <Text style={styles.employeePosition}>{employee.position}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Модальное окно */}
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
            <Picker
  selectedValue={position}
  onValueChange={(itemValue) => setPosition(itemValue)}
  style={styles.picker}
  itemStyle={{ fontSize: 16 }}
>
  <Picker.Item label="Саппорт" value="Саппорт" />
  <Picker.Item label="Мастер" value="Мастер" />
</Picker>

            <TouchableOpacity style={styles.modalButton} onPress={addEmployee}>
              <Text style={styles.modalButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  cardInfo: {
    flexDirection: 'column',
  },
  employeeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  employeePosition: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
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
  picker: {
  backgroundColor: '#F1F5F9',
  borderRadius: 10,
  height: 40,
  fontSize: 16,
  marginBottom: 8,
  color: '#1E293B',
},

});
