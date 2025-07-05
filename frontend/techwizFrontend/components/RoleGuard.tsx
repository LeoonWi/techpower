import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Shield, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackRoute?: any;
  showAccessDenied?: boolean;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackRoute = '/login',
  showAccessDenied = true 
}: RoleGuardProps) {
  const { user } = useAuth();

  // Если пользователь не авторизован, перенаправляем на логин
  if (!user) {
    if (fallbackRoute) {
      router.replace(fallbackRoute);
    }
    return null;
  }

  // Проверяем, есть ли у пользователя доступ
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={64} color="#DC2626" />
          </View>
          <Text style={styles.title}>Доступ запрещен</Text>
          <Text style={styles.description}>
            У вас нет прав для доступа к этому разделу.
          </Text>
          <Text style={styles.roleInfo}>
            Ваша роль: {user.role}
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (fallbackRoute) {
      router.replace(fallbackRoute);
    }
    return null;
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
    marginBottom: 16,
    lineHeight: 24,
  },
  roleInfo: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
}); 