import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Search, Plus, Trash2 } from 'lucide-react-native';
import AddMasterModal from './addmastermodal';

export default function MastersScreen() {
  const { user } = useAuth();
  const { masters, addMaster, deleteMaster } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Ограничение доступа только для support
  if ((user?.permission === '001')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Доступ запрещён</Text>
          <Text style={styles.emptyStateSubtext}>
            Эта страница доступна только для роли поддержки
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredMasters = masters.filter(master =>
    master.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    master.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    master.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteMaster = (masterId: string) => {
    deleteMaster(masterId);
    setShowDeleteConfirm(null);
    Alert.alert('Успешно', 'Мастер удалён');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Управление мастерами</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddMasterModal(true)}>
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
      </View>

      {/* Masters List */}
      <ScrollView 
        style={styles.mastersList}
        contentContainerStyle={styles.mastersListContent}
        showsVerticalScrollIndicator={true}
      >
        {filteredMasters.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Мастера не найдены</Text>
            <Text style={styles.emptyStateSubtext}>
              Попробуйте изменить поисковый запрос
            </Text>
          </View>
        ) : (
          filteredMasters.map((master) => (
            <View key={master.id} style={styles.masterItemContainer}>
              <View style={styles.masterItem}>
                <View style={styles.masterInfo}>
                  <Text style={styles.masterName}>{master.fullName}</Text>
                  <Text style={styles.masterCategory}>{master.category}</Text>
                  <Text style={styles.masterCity}>{master.city}</Text>
                </View>
                <View style={styles.masterStats}>
                  <Text style={styles.masterStatus}>
                    {master.isActive ? 'Активен' : 'Неактивен'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => setShowDeleteConfirm(master.id)}
                  >
                    <Trash2 size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Master Modal */}
      <AddMasterModal
        visible={showAddMasterModal}
        onClose={() => setShowAddMasterModal(false)}
        onAddMaster={(master) => {
          addMaster(master);
          Alert.alert('Успешно', 'Мастер добавлен');
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить мастера?</Text>
            <Text style={styles.deleteConfirmText}>
              Вы уверены, что хотите удалить этого мастера? Это действие нельзя отменить.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirm(null)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteConfirmButton}
                onPress={() => handleDeleteMaster(showDeleteConfirm!)}
              >
                <Text style={styles.deleteConfirmButtonText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  mastersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mastersListContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  masterItemContainer: {
    marginBottom: 16,
  },
  masterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  masterInfo: {
    flex: 1,
  },
  masterName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  masterCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    marginBottom: 2,
  },
  masterCity: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  masterStats: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  masterStatus: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  deleteConfirmText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
});