import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AlertTriangle, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface LimitedAdminGuardProps {
  children: React.ReactNode;
  allowedPages?: string[];
}

export default function LimitedAdminGuard({ children, allowedPages = ['/addemployeescreen'] }: LimitedAdminGuardProps) {
  const { user } = useAuth();

  // Если пользователь не ограниченный админ, показываем контент
  if (!user || user.role !== 'limitedAdmin') {
    return <>{children}</>;
  }

  // Проверяем, разрешена ли текущая страница
  const currentPath = router.canGoBack() ? 'current' : 'addemployeescreen';
  const isAllowed = allowedPages.some(page => currentPath.includes(page));

  if (!isAllowed) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Shield size={64} color="#DC2626" />
        </View>
        <Text style={styles.title}>Доступ ограничен</Text>
        <Text style={styles.description}>
          У вас ограниченный доступ. Вы можете только создавать новых сотрудников.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/addemployeescreen')}
        >
          <Text style={styles.buttonText}>Перейти к созданию сотрудников</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            // Выход из системы
            router.replace('/login');
          }}
        >
          <Text style={styles.logoutButtonText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  logoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
}); 