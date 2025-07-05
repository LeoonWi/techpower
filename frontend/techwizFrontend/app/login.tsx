import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Shield, Headphones as HeadphonesIcon, Wrench, Star, Crown } from 'lucide-react-native';
import { UserStatus } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

// =========================
// Интеграция с backend (авторизация):
// - Для входа пользователя отправляйте POST-запрос на /auth/signin с phone_number и password.
// - После успешного входа сохраняйте id пользователя (и токен, если появится) в хранилище (например, AsyncStorage).
// - Для регистрации используйте /auth/signup.
// - После входа используйте id для всех запросов, где требуется идентификация.
// - Обрабатывайте ошибки backend (error в JSON).
// =========================

const roles = [
  { role: 'admin' as UserStatus, title: 'Администратор', description: 'Полный доступ ко всем функциям', icon: Shield, color: '#DC2626' },
  { role: 'support' as UserStatus, title: 'Поддержка', description: 'Управление заявками и чатами', icon: HeadphonesIcon, color: '#2563EB' },
  { role: 'master' as UserStatus, title: 'Мастер', description: 'Календарь смен и статусы заказов', icon: Wrench, color: '#059669' },
];

const testUsers = [
  { username: 'admin', password: 'admin123', status: 'admin' },
  { username: 'support', password: 'support123', status: 'support' },
  { username: 'senior', password: 'senior123', status: 'senior_master' },
];

export default function LoginScreen() {
  const { login } = useAuth();

  const handleRoleSelect = (permission: string,phone: string,password: string) => {
    login(permission,phone,password) //ВОТ ЭТИ параметры должны быть и в roles на 18 строке,иначе 52 строка не заработает
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TechWiz</Text>
        <Text style={styles.subtitle}>Выберите роль для входа</Text>
      </View>
      <ScrollView style={styles.rolesList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Выберите роль:</Text>
        {roles.map(item => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={item.role}
              style={[styles.roleCard, { borderLeftColor: item.color }]}
              onPress={() => handleRoleSelect(item.role)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}> 
                <IconComponent size={24} color={item.color} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>{item.title}</Text>
                <Text style={styles.roleDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Демо версия приложения TechWiz</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', paddingVertical: 30 },
  title: { fontSize: 32, fontFamily: 'Inter-Bold', color: '#1E293B' },
  subtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#64748B' },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', marginBottom: 10, color: '#334155' },
  testUser: { fontSize: 14, color: '#475569', marginBottom: 4 },
  loginForm: { paddingHorizontal: 20, marginBottom: 20 },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    fontSize: 14,
    borderColor: '#CBD5E1',
    borderWidth: 1,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  loginButtonText: { color: 'white', fontSize: 16, fontFamily: 'Inter-SemiBold' },
  rolesList: { flex: 1, paddingHorizontal: 20, marginTop: 10 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  roleInfo: { flex: 1 },
  roleTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#1E293B', marginBottom: 4 },
  roleDescription: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#64748B' },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 12, fontFamily: 'Inter-Regular', color: '#94A3B8' },
});
