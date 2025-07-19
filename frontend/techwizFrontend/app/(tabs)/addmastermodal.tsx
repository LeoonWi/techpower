import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { apiClient } from '@/api/client';

const masterCategories = [
  { key: 'plumber', label: 'Сантехник' },
  { key: 'computer_technician', label: 'Компьютерный мастер' },
  { key: 'electrician', label: 'Электрик' },
  { key: 'carpenter', label: 'Плотник' },
  { key: 'general_repair', label: 'Общий ремонт' },
];

interface AddMasterModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMaster: (master: {
    fullName: string;
    phone: string;
    city: string;
    category: string;
    isActive: boolean;
  }) => void;
}

export default function AddMasterModal({ visible, onClose, onAddMaster }: AddMasterModalProps) {
  const [newMaster, setNewMaster] = useState({
    fullName: '',
    phone_number: '',
    city: '',
    category: masterCategories[0].key,
    password: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  const handleAddMaster = async () => {
    if (!newMaster.fullName.trim() || !newMaster.phone_number.trim() || !newMaster.password.trim() || !newMaster.city.trim() || !newMaster.category.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    setLoading(true);
    try {
      await apiClient.signUp({
        phone_number: newMaster.phone_number,
        full_name: newMaster.fullName,
        password: newMaster.password,
        permission: '002', // permission for master
        // Можно добавить city и category, если бэкенд поддерживает
      });
      onAddMaster({
        phone: newMaster.phone_number,
        fullName: newMaster.fullName,
        city: newMaster.city,
        category: newMaster.category,
        isActive: newMaster.isActive,
      });
      setNewMaster({
        fullName: '',
        phone_number: '',
        city: '',
        category: masterCategories[0].key,
        password: '',
        isActive: true,
      });
      onClose();
      Alert.alert('Успех', 'Мастер добавлен');
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось добавить мастера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Добавить нового мастера</Text>
          <ScrollView 
            style={styles.formContainer}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Имя мастера</Text>
              <TextInput
                style={styles.formInput}
                value={newMaster.fullName}
                onChangeText={(text) => setNewMaster({ ...newMaster, fullName: text })}
                placeholder="Введите имя"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Номер телефона</Text>
              <TextInput
                style={styles.formInput}
                value={newMaster.phone_number}
                onChangeText={(text) => setNewMaster({ ...newMaster, phone_number: text })}
                placeholder="Введите номер телефона"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Пароль</Text>
              <TextInput
                style={styles.formInput}
                value={newMaster.password}
                onChangeText={(text) => setNewMaster({ ...newMaster, password: text })}
                placeholder="Введите пароль"
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Город</Text>
              <TextInput
                style={styles.formInput}
                value={newMaster.city}
                onChangeText={(text) => setNewMaster({ ...newMaster, city: text })}
                placeholder="Введите город"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Категория</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newMaster.category}
                  onValueChange={(itemValue) => setNewMaster({ ...newMaster, category: itemValue })}
                  style={styles.picker}
                >
                  {masterCategories.map((cat) => (
                    <Picker.Item key={cat.key} label={cat.label} value={cat.key} />
                  ))}
                </Picker>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddMaster}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Добавить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    // maxHeight: '70%',
    borderWidth: 2,
    borderColor: 'red',
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
    paddingBottom: 120,
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
  pickerContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#1E293B',
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
});