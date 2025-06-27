import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, MapPin, Camera, CreditCard as Edit3, LogOut, CreditCard, Settings, Star, Crown, Wallet } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user || null);

  if (!user) {
    return null;
  }

  const handleSave = () => {
    if (editedUser) {
      updateUser(editedUser);
      setIsEditing(false);
      Alert.alert('Успешно', 'Профиль обновлен');
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
          onPress: () => {
            logout();
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

  const getRoleTitle = () => {
    const roleTitles = {
      admin: 'Администратор',
      support: 'Поддержка',
      master: 'Мастер',
      senior_master: 'Старший мастер',
      premium_master: 'Премиум мастер',
    };
    return roleTitles[user.role];
  };

  const getRoleBadgeColor = () => {
    const colors = {
      admin: '#DC2626',
      support: '#2563EB',
      master: '#059669',
      senior_master: '#EA580C',
      premium_master: '#7C3AED',
    };
    return colors[user.role];
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
              <User size={48} color="#64748B" />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.fullName}</Text>
              {user.role === 'premium_master' && <Crown size={20} color="#FFD700" />}
            </View>
            <View style={[styles.roleBadge, { backgroundColor: `${getRoleBadgeColor()}20` }]}>
              <Text style={[styles.roleText, { color: getRoleBadgeColor() }]}>{getRoleTitle()}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(!isEditing)}>
            <Edit3 size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet size={24} color="#2563EB" />
            <Text style={styles.balanceTitle}>Баланс</Text>
            <TouchableOpacity style={styles.topUpButton} onPress={handlePayment}>
              <CreditCard size={16} color="white" />
              <Text style={styles.topUpText}>Пополнить</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>{user.balance.toLocaleString('ru-RU')} ₽</Text>
          <Text style={styles.commissionInfo}>
            Комиссия: {user.commission}% • Статус: {user.isActive ? 'Активен' : 'Неактивен'}
          </Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Личная информация</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Полное имя *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                value={isEditing ? editedUser?.fullName : user.fullName}
                onChangeText={(text) => setEditedUser((prev) => (prev ? { ...prev, fullName: text } : null))}
                editable={isEditing}
                placeholder="Введите полное имя"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Никнейм *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                value={isEditing ? editedUser?.nickname : user.nickname}
                onChangeText={(text) => setEditedUser((prev) => (prev ? { ...prev, nickname: text } : null))}
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
                onChangeText={(text) => setEditedUser((prev) => (prev ? { ...prev, phone: text } : null))}
                editable={isEditing}
                placeholder="Введите номер телефона"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Город</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                value={isEditing ? editedUser?.city : user.city}
                onChangeText={(text) => setEditedUser((prev) => (prev ? { ...prev, city: text } : null))}
                editable={isEditing}
                placeholder="Введите город"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Категория</Text>
            <View style={styles.inputContainer}>
              <Star size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                value={isEditing ? editedUser?.category : user.category}
                onChangeText={(text) => setEditedUser((prev) => (prev ? { ...prev, category: text } : null))}
                editable={isEditing}
                placeholder="Введите категорию"
              />
            </View>
          </View>

          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  setEditedUser(user);
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
          <TouchableOpacity style={styles.settingItem}>
            <Settings size={20} color="#64748B" />
            <Text style={styles.settingText}>Настройки приложения</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handlePayment}>
            <CreditCard size={20} color="#64748B" />
            <Text style={styles.settingText}>Платежи и СБП</Text>
          </TouchableOpacity>

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
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
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