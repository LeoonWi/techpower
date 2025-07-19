import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router, usePathname } from 'expo-router';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Публичные маршруты, которые не требуют авторизации
  const publicRoutes = ['/login', '/auth'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Если загрузка завершена и пользователь не авторизован, перенаправляем на login
    // НО только если это не публичный маршрут
    if (!isLoading && !user && !isPublicRoute) {
      router.replace('/login');
    }
  }, [isLoading, user, isPublicRoute]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  // Если это публичный маршрут, всегда показываем детей
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Если пользователь не авторизован на защищенном маршруте, показываем загрузку до перенаправления
  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Перенаправление...</Text>
      </View>
    );
  }

  // Только если пользователь авторизован, показываем детей
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
}); 