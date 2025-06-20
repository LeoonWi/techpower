import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { TriangleAlert as AlertTriangle, Search, Filter, Clock, CircleCheck as CheckCircle, User, Phone } from 'lucide-react-native';

export default function ComplaintsScreen() {
  const { user } = useAuth();
  const { complaints, resolveComplaint } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  if (user?.role !== 'support' && user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <AlertTriangle size={48} color="#64748B" />
          <Text style={styles.accessDeniedText}>Нет доступа к жалобам</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filters = [
    { key: 'all', label: 'Все' },
    { key: 'open', label: 'Открытые' },
    { key: 'resolved', label: 'Решенные' },
  ];

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || complaint.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleResolveComplaint = (complaintId: string) => {
    Alert.alert(
      'Решить жалобу',
      'Вы уверены, что хотите отметить эту жалобу как решенную?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Решить', onPress: () => {
          resolveComplaint(complaintId, user!.id);
          Alert.alert('Успешно', 'Жалоба отмечена как решенная');
        }},
      ]
    );
  };

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Жалобы и обращения</Text>
        <Text style={styles.subtitle}>Управление обращениями пользователей</Text>
      </View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <AlertTriangle size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Всего</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={20} color="#EF4444" />
          <Text style={styles.statNumber}>{stats.open}</Text>
          <Text style={styles.statLabel}>Открытых</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.statNumber}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>Решенных</Text>
        </View>
      </View>

      {/* Поиск и фильтры */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск жалоб..."
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

      {/* Список жалоб */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.complaintsList}>
        {filteredComplaints.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color="#64748B" />
            <Text style={styles.emptyStateText}>Жалобы не найдены</Text>
            <Text style={styles.emptyStateSubtext}>
              Попробуйте изменить фильтры или поисковый запрос
            </Text>
          </View>
        ) : (
          filteredComplaints.map((complaint) => (
            <View key={complaint.id} style={styles.complaintCard}>
              <View style={styles.complaintHeader}>
                <Text style={styles.complaintTitle}>{complaint.title}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: complaint.status === 'open' ? '#FEF3C7' : '#D1FAE5' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: complaint.status === 'open' ? '#D97706' : '#059669' }
                  ]}>
                    {complaint.status === 'open' ? 'Открыта' : 'Решена'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.complaintDescription}>{complaint.description}</Text>
              
              <View style={styles.complaintAuthor}>
                <User size={16} color="#64748B" />
                <Text style={styles.complaintAuthorText}>От: {complaint.authorName}</Text>
              </View>
              
              <View style={styles.complaintFooter}>
                <Text style={styles.complaintDate}>
                  {complaint.createdAt.toLocaleDateString('ru-RU')} в {complaint.createdAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {complaint.status === 'open' && (
                  <TouchableOpacity 
                    style={styles.resolveButton}
                    onPress={() => handleResolveComplaint(complaint.id)}
                  >
                    <CheckCircle size={16} color="white" />
                    <Text style={styles.resolveButtonText}>Решить</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {complaint.status === 'resolved' && complaint.resolvedAt && (
                <View style={styles.resolvedInfo}>
                  <Text style={styles.resolvedText}>
                    Решена {complaint.resolvedAt.toLocaleDateString('ru-RU')} в {complaint.resolvedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 90,
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
    marginTop: 16,
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
    fontFamily: 'Inter-SemiBold',
  },
  complaintsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  complaintCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  complaintTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
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
  complaintDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  complaintAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  complaintAuthorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 6,
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  resolveButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 4,
  },
  resolvedInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  resolvedText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#10B981',
  },
});