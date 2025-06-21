import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Shield, Headphones as HeadphonesIcon, Wrench, Star, Crown } from 'lucide-react-native';
import { UserRole } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

const roles = [
  { role: 'admin' as UserRole, title: 'Администратор', description: 'Полный доступ ко всем функциям', icon: Shield, color: '#DC2626' },
  { role: 'support' as UserRole, title: 'Поддержка', description: 'Управление заявками и чатами', icon: HeadphonesIcon, color: '#2563EB' },
  { role: 'master' as UserRole, title: 'Мастер', description: 'Календарь смен и статусы заказов', icon: Wrench, color: '#059669' },
  { role: 'senior_master' as UserRole, title: 'Старший мастер', description: 'Выбор заказов и управление мастерами', icon: Star, color: '#EA580C' },
  { role: 'premium_master' as UserRole, title: 'Премиум мастер', description: 'Пониженная комиссия и премиум заказы', icon: Crown, color: '#7C3AED' },
];

const testUsers = [
  { username: 'admin', password: 'admin123', status: 'admin' },
  { username: 'support', password: 'support123', status: 'support' },
  { username: 'senior', password: 'senior123', status: 'senior_master' },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleLogin = () => {
    const user = testUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setStatus(user.status);
    } else {
      Alert.alert('Ошибка', 'Неверный логин или пароль');
    }
  };

  const getAvailableRoles = () => {
    switch (status) {
      case 'admin':
        return roles;
      case 'support':
        return roles.filter(r => r.role === 'support');
      case 'senior_master':
        return roles.filter(r => ['master', 'premium_master'].includes(r.role));
      default:
        return [];
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TechWiz</Text>
        <Text style={styles.subtitle}>Тестовый вход в систему</Text>
      </View>

      {/* Вход */}
      {!status && (
        <View style={styles.loginForm}>
          <Text style={styles.sectionTitle}>Тестовые аккаунты:</Text>
          {testUsers.map(user => (
            <Text key={user.username} style={styles.testUser}>
              {user.username} / {user.password}
            </Text>
          ))}
          <TextInput
            placeholder="Логин"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Роли */}
      {status && (
        <ScrollView style={styles.rolesList} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Выберите роль:</Text>
          {getAvailableRoles().map(item => {
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
      )}

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
