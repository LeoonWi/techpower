import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import apiClient from '@/api/client';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.getUser(id as string)
      .then(data => {
        setUser(data);
        setError(null);
      })
      .catch(e => {
        setError(e.message || 'Ошибка загрузки профиля');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;
  }
  if (!user) {
    return <View style={styles.center}><Text>Пользователь не найден</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{user.full_name || 'Без имени'}</Text>
      <Text style={styles.label}>Телефон: <Text style={styles.value}>{user.phone_number}</Text></Text>
      <Text style={styles.label}>Никнейм: <Text style={styles.value}>{user.nickname || '-'}</Text></Text>
      <Text style={styles.label}>Роль: <Text style={styles.value}>{user.permission}</Text></Text>
      <Text style={styles.label}>Баланс: <Text style={styles.value}>{user.balance ?? 0} ₽</Text></Text>
      <Text style={styles.label}>Статус: <Text style={styles.value}>{user.status || '-'}</Text></Text>
      {/* Добавьте другие поля по необходимости */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1E293B',
  },
  label: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  value: {
    color: '#1E293B',
    fontWeight: '600',
  },
}); 