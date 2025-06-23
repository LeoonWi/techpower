import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Bell, Shield, Palette, Globe, CircleHelp as HelpCircle, Info, LogOut, Moon, Volume2, Smartphone } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: () => {
          logout();
        }},
      ]
    );
  };

  const settingSections = [
    {
      title: 'Уведомления',
      items: [
        {
          icon: Bell,
          title: 'Push-уведомления',
          subtitle: 'Получать уведомления о новых заказах',
          type: 'switch',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: Volume2,
          title: 'Звуковые уведомления',
          subtitle: 'Звуковые сигналы для уведомлений',
          type: 'switch',
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
      ],
    },
    {
      title: 'Внешний вид',
      items: [
        {
          icon: Moon,
          title: 'Темная тема',
          subtitle: 'Использовать темное оформление',
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: Palette,
          title: 'Цветовая схема',
          subtitle: 'Настройка цветов интерфейса',
          type: 'navigation',
          onPress: () => Alert.alert('Настройки', 'Функция в разработке'),
        },
      ],
    },
    {
      title: 'Приложение',
      items: [
        {
          icon: Globe,
          title: 'Язык',
          subtitle: 'Русский',
          type: 'navigation',
          onPress: () => Alert.alert('Настройки', 'Функция в разработке'),
        },
        {
          icon: Smartphone,
          title: 'Версия приложения',
          subtitle: '1.0.0',
          type: 'info',
        },
      ],
    },
    {
      title: 'Безопасность',
      items: [
        {
          icon: Shield,
          title: 'Безопасность',
          subtitle: 'Настройки безопасности аккаунта',
          type: 'navigation',
          onPress: () => Alert.alert('Безопасность', 'Функция в разработке'),
        },
      ],
    },
    {
      title: 'Поддержка',
      items: [
        {
          icon: HelpCircle,
          title: 'Помощь',
          subtitle: 'Часто задаваемые вопросы',
          type: 'navigation',
          onPress: () => Alert.alert('Помощь', 'Функция в разработке'),
        },
        {
          icon: Info,
          title: 'О приложении',
          subtitle: 'Информация о TechWiz',
          type: 'navigation',
          onPress: () => Alert.alert('О приложении', 'TechWiz - мобильное приложение для управления техническими заказами'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.fullName.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <Text style={styles.userRole}>{user?.role}</Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      itemIndex === section.items.length - 1 && styles.settingItemLast
                    ]}
                    onPress={item.onPress}
                    disabled={item.type === 'info' || item.type === 'switch'}
                  >
                    <View style={styles.settingItemLeft}>
                      <View style={styles.settingIcon}>
                        <IconComponent size={20} color="#64748B" />
                      </View>
                      <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>{item.title}</Text>
                        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                      </View>
                    </View>
                    {item.type === 'switch' && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                        thumbColor={item.value ? 'white' : '#F1F5F9'}
                      />
                    )}
                    {item.type === 'navigation' && (
                      <Text style={styles.settingArrow}>›</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionContent: {
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  settingArrow: {
    fontSize: 20,
    color: '#94A3B8',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 8,
  },
});