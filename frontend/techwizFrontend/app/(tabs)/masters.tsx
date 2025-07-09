import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Search, Filter, User, Crown, MapPin, Phone, TrendingUp, DollarSign, ClipboardList } from 'lucide-react-native';

export default function MastersScreen() {
  const { user } = useAuth();
  const { masters } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  if (user?.permission === '100' || user?.permission === '010') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Нет доступа к управлению мастерами</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filters = [
    { key: 'all', label: 'Все' },
    { key: 'active', label: 'Активные' },
    { key: 'inactive', label: 'Неактивные' },
  ];

  const filteredMasters = masters.filter(master => {
    const matchesSearch = master.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         master.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         master.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = () => {
      switch (selectedFilter) {
        case 'active':
          return master.isActive;
        case 'inactive':
          return !master.isActive;
        default:
          return true;
      }
    };

    return matchesSearch && matchesFilter();
  });

  const getRoleIcon = (role: string) => {
    return User;
  };

  const getRoleColor = (role: string) => {
    return '#059669';
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'senior_master':
        return 'Старший мастер';
      case 'premium_master':
        return 'Премиум мастер';
      case 'master':
        return 'Мастер';
      default:
        return 'Мастер';
    }
  };

  const handleMasterAction = (masterId: string, action: string) => {
    Alert.alert(
      'Действие с мастером',
      `Выполнить действие "${action}" для мастера?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Подтвердить', onPress: () => {
          // Здесь будет логика действий с мастером
          Alert.alert('Успешно', `Действие "${action}" выполнено`);
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Управление мастерами</Text>
        <Text style={styles.subtitle}>Контроль и аналитика работы мастеров</Text>
      </View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <TrendingUp size={20} color="#2563EB" />
          <Text style={styles.statNumber}>{masters.length}</Text>
          <Text style={styles.statLabel}>Всего мастеров</Text>
        </View>
        <View style={styles.statCard}>
          <User size={20} color="#059669" />
          <Text style={styles.statNumber}>{masters.filter(m => m.isActive).length}</Text>
          <Text style={styles.statLabel}>Активных</Text>
        </View>
        <View style={styles.statCard}>
          <User size={20} color="#DC2626" />
          <Text style={styles.statNumber}>{masters.filter(m => !m.isActive).length}</Text>
          <Text style={styles.statLabel}>Неактивных</Text>
        </View>

      </View>

      {/* Поиск и фильтры */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск мастеров..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Фильтры */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.filterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Список мастеров */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.mastersList}>
        {filteredMasters.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Мастера не найдены</Text>
            <Text style={styles.emptyStateSubtext}>
              Попробуйте изменить фильтры или поисковый запрос
            </Text>
          </View>
        ) : (
          filteredMasters.map((master) => {
            const IconComponent = getRoleIcon(master.role);
            const stats = { orders: 0, earnings: 0 };
            
            return (
              <View key={master.id} style={styles.masterCard}>
                <View style={styles.masterHeader}>
                  <View style={styles.masterAvatar}>
                    <IconComponent size={24} color={getRoleColor(master.role)} />
                  </View>
                  <View style={styles.masterInfo}>
                    <View style={styles.masterNameRow}>
                      <Text style={styles.masterName}>{master.fullName}</Text>
                    </View>
                    <Text style={styles.masterRole}>
                      {getRoleTitle(master.role)}
                      {(master.role === 'senior_master' || master.role === 'premium_master') && (
                        <Text style={styles.masterStatus}> • {master.isActive ? 'Активен' : 'Неактивен'}</Text>
                      )}
                    </Text>
                    <View style={styles.masterLocation}>
                      <MapPin size={12} color="#64748B" />
                      <Text style={styles.masterLocationText}>{master.city}</Text>
                    </View>
                  </View>
                  {master.role === 'master' && (
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: master.isActive ? '#D1FAE5' : '#FEE2E2' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: master.isActive ? '#059669' : '#DC2626' }
                      ]}>
                        {master.isActive ? 'Активен' : 'Неактивен'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.masterDetails}>
                  <Text style={styles.masterCategory}>{master.category}</Text>
                  <View style={styles.masterContact}>
                    <Phone size={12} color="#64748B" />
                    <Text style={styles.masterPhone}>{master.phone}</Text>
                  </View>
                </View>

                {/* Статистика мастера */}
                <View style={styles.masterStats}>
                  <View style={styles.masterStatItem}>
                    <ClipboardList size={16} color="#2563EB" />
                    <Text style={styles.masterStatValue}>{stats.orders}</Text>
                    <Text style={styles.masterStatLabel}>Заказов</Text>
                  </View>
                  <View style={styles.masterStatItem}>
                    <DollarSign size={16} color="#059669" />
                    <Text style={styles.masterStatValue}>
                      {stats.earnings.toLocaleString('ru-RU')} ₽
                    </Text>
                    <Text style={styles.masterStatLabel}>Доход</Text>
                  </View>
                </View>

                {/* Действия */}
                <View style={styles.masterActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleMasterAction(master.id, 'view_details')}
                  >
                    <Text style={styles.actionButtonText}>Детали</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 90, // Отступ для нижней панели
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  accessDeniedText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  filterButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersContainer: {
    marginBottom: 16,
    maxHeight: 35
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: 'white',
  },
  mastersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  masterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  masterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  masterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  masterInfo: {
    flex: 1,
  },
  masterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  masterName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginRight: 8,
  },
  masterRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    marginBottom: 4,
  },
  masterStatus: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  masterLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterLocationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  masterDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  masterCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  masterContact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterPhone: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 4,
  },
  masterStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  masterStatItem: {
    alignItems: 'center',
  },
  masterStatValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 4,
    marginBottom: 2,
  },
  masterStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  masterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  actionButtonSecondary: {
    backgroundColor: '#F1F5F9',
  },
  actionButtonSecondaryText: {
    color: '#64748B',
  },
  actionButtonDanger: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonDangerText: {
    color: '#DC2626',
  },
});