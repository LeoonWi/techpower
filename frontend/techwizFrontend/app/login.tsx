import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { Shield, Headphones as HeadphonesIcon, Wrench, Star, Crown } from 'lucide-react-native';

const roles = [
  {
    role: 'admin' as UserRole,
    title: 'Администратор',
    description: 'Полный доступ ко всем функциям',
    icon: Shield,
    color: '#DC2626',
  },
  {
    role: 'support' as UserRole,
    title: 'Поддержка',
    description: 'Управление заявками и чатами',
    icon: HeadphonesIcon,
    color: '#2563EB',
  },
  {
    role: 'master' as UserRole,
    title: 'Мастер',
    description: 'Календарь смен и статусы заказов',
    icon: Wrench,
    color: '#059669',
  },
  {
    role: 'senior_master' as UserRole,
    title: 'Старший мастер',
    description: 'Выбор заказов и управление мастерами',
    icon: Star,
    color: '#EA580C',
  },
  {
    role: 'premium_master' as UserRole,
    title: 'Премиум мастер',
    description: 'Пониженная комиссия и премиум заказы',
    icon: Crown,
    color: '#7C3AED',
  },
];

export default function LoginScreen() {
  const { login } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TechWiz</Text>
        <Text style={styles.subtitle}>Выберите роль для входа</Text>
      </View>

      <ScrollView style={styles.rolesList} showsVerticalScrollIndicator={false}>
        {roles.map((item) => {
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
        <Text style={styles.footerText}>
          Демо версия приложения TechWiz
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  rolesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
});