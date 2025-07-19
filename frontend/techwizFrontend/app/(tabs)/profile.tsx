import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, Phone, MapPin, Camera, LogOut, Star, Wallet } from 'lucide-react-native';
import apiClient from '@/api/client';
import * as SecureStore from 'expo-secure-store';
import { getRoleTitle } from '@/utils/roleUtils';

// =========================
// Интеграция с backend (профиль пользователя):
// - Для получения профиля используйте GET-запрос на /user/{id}.
// - Для смены пароля используйте PATCH-запрос на /user/changepassword с id и новым password.
// - Для добавления/удаления категории используйте PATCH-запросы /user/category/add и /user/category/remove с параметрами user и category.
// - Тип пользователя должен соответствовать модели User из backend.
// - После успешных операций обновляйте локальное состояние.
// - Обрабатывайте ошибки backend.
// =========================

export default function ProfileScreen() {
  const { user: authUser, logout, updateUser, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Используем пользователя из AuthContext
  const user = authUser;

  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
  }, [user]);

  if (isLoading) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }
  if (error) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{ color: 'red' }}>{error}</Text></View>;
  }
  if (!user) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Пользователь не найден</Text></View>;
  }

  const checkForChanges = (newValue: any) => {
    if (!user) return false;
    const hasNicknameChanged = newValue.nickname !== user.nickname;
    const hasPhoneChanged = newValue.phone !== user.phone;
    setHasChanges(hasNicknameChanged || hasPhoneChanged);
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Ошибка', 'Не удалось определить ID пользователя');
      return;
    }
    if (editedUser && hasChanges) {
      try {
        const updatePayload: any = {};
        if (editedUser.nickname !== user.nickname) updatePayload.nickname = editedUser.nickname;
        if (editedUser.phone !== user.phone) updatePayload.phone_number = editedUser.phone;
        if (!updatePayload.nickname && !updatePayload.phone_number) {
          Alert.alert('Нет изменений', 'Измените хотя бы одно поле');
          return;
        }
        const updated = await apiClient.updateUser(user.id, updatePayload);
        setEditedUser(updated);
        setHasChanges(false);
        Alert.alert('Успешно', 'Профиль обновлен');
      } catch (e: any) {
        Alert.alert('Ошибка', e?.message || 'Не удалось обновить профиль');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Перенаправляем на экран логина после выхода
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handlePayment = () => {
    Alert.alert('Пополнение баланса', 'Интеграция с СБП (Система быстрых платежей) для пополнения баланса', [
      { text: 'OK' },
    ]);
  };

  const getRoleTitleLocal = () => {
    return getRoleTitle(user.role || '');
  };

  const getRoleBadgeColor = () => {
    const colors: { [key: string]: string } = {
      admin: '#DC2626',
      limitedAdmin: '#F59E0B',
      support: '#2563EB',
      master: '#059669',
      senior_master: '#7C3AED',
      premium_master: '#F59E0B',
    };
    return colors[String(user.role)] || '#64748B';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent} // Added contentContainerStyle
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <UserIcon size={48} color="#64748B" />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.fullName || 'Без имени'}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: `${getRoleBadgeColor()}20` }]}>
              <Text style={[styles.roleText, { color: getRoleBadgeColor() }]}>{getRoleTitleLocal()}</Text>
            </View>
          </View>


        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet size={24} color="#2563EB" />
            <Text style={styles.balanceTitle}>Баланс</Text>
            <TouchableOpacity style={styles.topUpButton} onPress={handlePayment}>
              <Wallet size={16} color="white" />
              <Text style={styles.topUpText}>Пополнить</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {typeof user.balance === 'number' ? user.balance.toLocaleString('ru-RU') : '0'} ₽
          </Text>
          <Text style={styles.commissionInfo}>
            Комиссия: {user.commission}% • Статус: {user.isActive ? 'Активен' : 'Неактивен'}
          </Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Личная информация</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Полное имя</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <UserIcon size={20} color="#64748B" />
              <Text style={styles.readOnlyText}>{user.fullName || 'Не указано'}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Никнейм *</Text>
            <View style={styles.inputContainer}>
              <UserIcon size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                value={isEditing ? editedUser?.nickname : user.nickname}
                onChangeText={(text) => {
                  const newValue = editedUser ? { ...editedUser, nickname: text } : { ...user, nickname: text };
                  setEditedUser(newValue);
                  checkForChanges(newValue);
                }}
                editable={isEditing}
                placeholder="Введите никнейм"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Телефон *</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                value={isEditing ? editedUser?.phone : user.phone}
                onChangeText={(text) => {
                  const newValue = editedUser ? { ...editedUser, phone: text } : { ...user, phone: text };
                  setEditedUser(newValue);
                  checkForChanges(newValue);
                }}
                editable={isEditing}
                placeholder="Введите номер телефона"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Категория</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <Star size={20} color="#64748B" />
              <Text style={styles.readOnlyText}>{user.category}</Text>
            </View>
          </View>

          {isEditing && hasChanges && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(true);
                  setEditedUser(user);
                  setHasChanges(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.settingText, styles.logoutText]}>Выйти из аккаунта</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 40, // Added padding to ensure content is not cut off
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginRight: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  editButton: {
    padding: 8,
  },
  balanceCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
    flex: 1,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  topUpText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  commissionInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  formContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  readOnlyInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginLeft: 12,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  settingsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 40, // Increased marginBottom for extra space
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
  },
});