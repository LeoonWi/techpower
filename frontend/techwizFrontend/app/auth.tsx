import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Shield, Headphones, Wrench } from 'lucide-react-native';
import { UserRole } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen() {
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { authenticate, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Администратор',
          description: 'Полный доступ ко всем функциям',
          icon: Shield,
          color: '#DC2626',
          placeholder: 'Введите номер телефона',
          permission: '100'
        };
      case 'support':
        return {
          title: 'Поддержка',
          description: 'Управление заявками и чатами',
          icon: Headphones,
          color: '#2563EB',
          placeholder: 'Введите номер телефона',
                    permission: '010'
        };
      case 'master':
        return {
          title: 'Мастер',
          description: 'Календарь смен и статусы заказов',
          icon: Wrench,
          color: '#059669',
          placeholder: 'Введите номер телефона',
                    permission: '001'
        };
      default:
        return {
          title: 'Пользователь',
          description: 'Базовый доступ',
          icon: Shield,
          color: '#6B7280',
          placeholder: 'Введите номер телефона',
          permission: '000'
        };
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    try {
      const success = await authenticate(username, password, roleInfo.permission);
      console.log('auth result:', success);
      if (success) {
        // login(role);
        console.log('переход');
        router.replace('/(tabs)/profile');
      } else {
        Alert.alert('Ошибка', 'Неверный логин или пароль ' + JSON.stringify([success, username, password, roleInfo.permission]));
      }
    } catch (error) {
      console.log('handleLogin error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при входе');
    }
  };

  const roleInfo = getRoleInfo(role);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Авторизация</Text>
      </View>

      <View style={styles.roleCard}>
        <View style={[styles.iconContainer, { backgroundColor: `${roleInfo.color}20` }]}>
          <roleInfo.icon size={32} color={roleInfo.color} />
        </View>
        <View style={styles.roleInfo}>
          <Text style={styles.roleTitle}>{roleInfo.title}</Text>
          <Text style={styles.roleDescription}>{roleInfo.description}</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Номер телефона</Text>
                  <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="79XXXXXXXXX"
            keyboardType="phone-pad"
            maxLength={11}
          />

        <Text style={styles.label}>Пароль</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Введите пароль"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Войти</Text>
        </TouchableOpacity>
      </View>

      {/*<View style={styles.adminHint}>
        <Text style={styles.hintText}>
          💡 Демо аккаунты:{'\n'}
          {role === 'admin' && '79001234567 / admin123 (ограниченный доступ)'}{'\n'}
          {role === 'support' && '79002345678 / support123'}{'\n'}
          {role === 'master' && '79003456789 / master123'}
        </Text>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  adminHint: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  hintText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
  },
}); 