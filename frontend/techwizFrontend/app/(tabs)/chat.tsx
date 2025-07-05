// =========================
// Интеграция с backend (чаты и сообщения):
// - Для создания чата используйте POST-запрос на /chat/create/{member1}/{member2}.
// - Для получения всех чатов пользователя используйте GET-запрос на /chat/{userId}.
// - Для получения чата между двумя пользователями используйте GET-запрос на /chat/{member1}/{member2}.
// - Для обмена сообщениями используйте WebSocket /ws.
// - Типы чата и сообщений должны соответствовать моделям backend.
// - После успешных операций обновляйте локальное состояние.
// - Обрабатывайте ошибки backend.
// =========================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Send, ArrowLeft, Users, TriangleAlert as AlertTriangle, Plus, Filter, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

interface User {
  id: string;
  fullName: string;
  role: string;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { chatCategories, messages, sendMessage, addComplaint } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>(user?.id || 'all');
  
  // Мок-данные пользователей для демонстрации
  const mockUsers: User[] = [
    { id: '1', fullName: 'Иван Иванов', role: 'support' },
    { id: '2', fullName: 'Петр Петров', role: 'master' },
    { id: '3', fullName: 'Анна Сидорова', role: 'support' },
    { id: '4', fullName: 'Михаил Козлов', role: 'master' },
  ];

  // Форма создания чата
  const [createChatForm, setCreateChatForm] = useState({
    user1: user?.id || '',
    user2: '',
  });

  const selectedCategoryData = chatCategories.find(cat => cat.id === selectedCategory);
  const categoryMessages = messages.filter(msg => msg.category === selectedCategory);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedCategory && user) {
      sendMessage(selectedCategory, messageText.trim(), user.id, user.fullName);
      setMessageText('');
    }
  };

  const handleSubmitComplaint = () => {
    if (complaintText.trim() && user) {
      addComplaint(
        'Жалоба от пользователя',
        complaintText.trim(),
        user.id,
        user.fullName
      );
      setComplaintText('');
      setShowComplaintForm(false);
    }
  };



  const handleCreateChat = () => {
    if (createChatForm.user1 && createChatForm.user2) {
      // Здесь будет логика создания чата
      const user1Name = user?.role === 'master' ? user.fullName : mockUsers.find(u => u.id === createChatForm.user1)?.fullName;
      const user2Name = mockUsers.find(u => u.id === createChatForm.user2)?.fullName;
      
      Alert.alert(
        'Чат создан успешно', 
        `Чат между ${user1Name} и ${user2Name} создан.\n\nID чата: ${createChatForm.user1}_${createChatForm.user2}`
      );
      
      // Сбрасываем форму
      setCreateChatForm({ 
        user1: user?.id || '', 
        user2: '' 
      });
      setShowCreateChatModal(false);
    } else {
      Alert.alert('Ошибка', 'Выберите пользователя поддержки');
    }
  };

  // Фильтруем категории чатов в зависимости от роли
  const getAvailableCategories = () => {
    if (user?.role === 'support') {
      return chatCategories;
    }
    
    if (user?.role === 'master') {
      return chatCategories.filter(cat => 
        cat.name === user.category || 
        cat.id === 'support'
      );
    }
    
    if (user?.role === 'admin') {
      return chatCategories;
    }
    
    return chatCategories;
  };

  const availableCategories = getAvailableCategories();

  // Фильтруем чаты по выбранному пользователю
  const getFilteredCategories = () => {
    if (selectedUserFilter === 'all') {
      return availableCategories;
    }
    
    // Фильтруем категории, где участвует выбранный пользователь
    return availableCategories.filter(category => {
      // Проверяем, есть ли сообщения от выбранного пользователя в этой категории
      return messages.some(message => 
        message.category === category.id && 
        message.senderId === selectedUserFilter
      );
    });
  };

  const filteredCategories = getFilteredCategories();

  if (selectedCategory) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedCategory(null)}
            >
              <ArrowLeft size={24} color="#1E293B" />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatTitle}>{selectedCategoryData?.name}</Text>
              <View style={styles.participantsInfo}>
                <Users size={14} color="#64748B" />
                <Text style={styles.participantsText}>
                  {selectedCategoryData?.participantCount} участников
                </Text>
              </View>
            </View>
          </View>

          <ScrollView 
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={true}
          >
            {categoryMessages.length === 0 ? (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>Начните общение в этой категории</Text>
              </View>
            ) : (
              categoryMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageContainer,
                    message.senderId === user?.id && styles.myMessageContainer
                  ]}
                >
                  <View style={[
                    styles.messageBubble,
                    message.senderId === user?.id && styles.myMessageBubble
                  ]}>
                    {message.senderId !== user?.id && (
                      <Text style={styles.senderName}>{message.senderName}</Text>
                    )}
                    <Text style={[
                      styles.messageText,
                      message.senderId === user?.id && styles.myMessageText
                    ]}>
                      {message.content}
                    </Text>
                    <Text style={[
                      styles.messageTime,
                      message.senderId === user?.id && styles.myMessageTime
                    ]}>
                      {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Напишите сообщение..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send size={20} color={messageText.trim() ? 'white' : '#94A3B8'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (showComplaintForm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowComplaintForm(false)}
          >
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Подать жалобу</Text>
        </View>

        <ScrollView 
          style={styles.complaintForm}
          contentContainerStyle={styles.complaintFormContent}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.formLabel}>Опишите проблему</Text>
          <TextInput
            style={styles.complaintInput}
            placeholder="Подробно опишите вашу жалобу..."
            value={complaintText}
            onChangeText={setComplaintText}
            multiline
            numberOfLines={6}
            maxLength={1000}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowComplaintForm(false)}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, !complaintText.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmitComplaint}
              disabled={!complaintText.trim()}
            >
              <Text style={styles.submitButtonText}>Отправить</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Чаты</Text>
        <View style={styles.headerActions}>
          {(user?.role === 'admin' || user?.role === 'support' || user?.role === 'master') && (
            <TouchableOpacity 
              style={styles.createChatButton}
              onPress={() => setShowCreateChatModal(true)}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Фильтр пользователей */}
      {(user?.role === 'admin' || user?.role === 'support') && (
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Filter size={16} color="#64748B" />
            <Text style={styles.filterTitle}>Фильтр по пользователю</Text>
          </View>
          <Picker
            selectedValue={selectedUserFilter}
            onValueChange={(itemValue) => setSelectedUserFilter(itemValue)}
            style={styles.filterPicker}
          >
            <Picker.Item label="Все чаты" value="all" />
            <Picker.Item 
              label={`Мои чаты (${user?.fullName})`} 
              value={user?.id || 'all'} 
            />
            {mockUsers.filter(u => u.id !== user?.id).map((user) => (
              <Picker.Item 
                key={user.id} 
                label={`Чаты ${user.fullName} (${user.role === 'master' ? 'Мастер' : 'Поддержка'})`} 
                value={user.id} 
              />
            ))}
          </Picker>
        </View>
      )}

      <Text style={styles.subtitle}>
        {user?.role === 'master' 
          ? 'Выберите категорию для общения или создайте чат с поддержкой' 
          : 'Выберите категорию для общения'
        }
      </Text>

      <ScrollView 
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesListContent}
        showsVerticalScrollIndicator={true}
      >
        {user?.role === 'master' && (
          <>
            <TouchableOpacity
              style={styles.createSupportChatButton}
              onPress={() => setShowCreateChatModal(true)}
            >
              <Users size={20} color="#2563EB" />
              <Text style={styles.createSupportChatButtonText}>Создать чат с поддержкой</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.complaintButton}
              onPress={() => setShowComplaintForm(true)}
            >
              <AlertTriangle size={20} color="#EF4444" />
              <Text style={styles.complaintButtonText}>Подать жалобу</Text>
            </TouchableOpacity>
          </>
        )}

        {filteredCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.participantsBadge}>
                <Users size={12} color="#64748B" />
                <Text style={styles.participantsBadgeText}>
                  {category.participantCount}
                </Text>
              </View>
            </View>
            {category.lastMessage && (
              <View style={styles.lastMessage}>
                <Text style={styles.lastMessageText} numberOfLines={1}>
                  {category.lastMessage.senderName}: {category.lastMessage.content}
                </Text>
                <Text style={styles.lastMessageTime}>
                  {new Date(category.lastMessage.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal создания чата */}
      <Modal
        visible={showCreateChatModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {user?.role === 'master' ? 'Создать чат с поддержкой' : 'Создать чат'}
              </Text>
              <TouchableOpacity onPress={() => setShowCreateChatModal(false)}>
                <X size={24} color="#334155" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {user?.role === 'master' ? 'Пользователь 1 (Вы)' : 'Пользователь 1'}
              </Text>
              {user?.role === 'master' ? (
                <View style={styles.userInfoContainer}>
                  <TextInput
                    style={[styles.formInput, styles.readOnlyInput]}
                    value={`${user.fullName} (ID: ${user.id})`}
                    editable={false}
                  />
                  <Text style={styles.userIdText}>ID: {user.id}</Text>
                </View>
              ) : (
                <Picker
                  selectedValue={createChatForm.user1}
                  onValueChange={(itemValue) => setCreateChatForm({ ...createChatForm, user1: itemValue })}
                  style={styles.formPicker}
                >
                  <Picker.Item label="Выберите пользователя" value="" />
                  {mockUsers.map((user) => (
                    <Picker.Item 
                      key={user.id} 
                      label={`${user.fullName} (${user.role === 'master' ? 'Мастер' : 'Поддержка'})`} 
                      value={user.id} 
                    />
                  ))}
                </Picker>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {user?.role === 'master' ? 'Пользователь 2 (Поддержка)' : 'Пользователь 2'}
              </Text>
              <Picker
                selectedValue={createChatForm.user2}
                onValueChange={(itemValue) => setCreateChatForm({ ...createChatForm, user2: itemValue })}
                style={styles.formPicker}
              >
                <Picker.Item label="Выберите пользователя" value="" />
                {mockUsers
                  .filter(u => user?.role === 'master' ? u.role === 'support' : u.id !== createChatForm.user1)
                  .map((user) => (
                    <Picker.Item 
                      key={user.id} 
                      label={`${user.fullName} (${user.role === 'master' ? 'Мастер' : 'Поддержка'})`} 
                      value={user.id} 
                    />
                  ))}
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateChatModal(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, !createChatForm.user2 && styles.submitButtonDisabled]}
                onPress={handleCreateChat}
                disabled={!createChatForm.user2}
              >
                <Text style={styles.submitButtonText}>Создать</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  categoriesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesListContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  complaintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  complaintButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 8,
  },
  categoryCard: {
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  participantsBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 4,
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  lastMessage: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    flex: 1,
  },
  lastMessageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginLeft: 8,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messagesContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyChatText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: '#E2E8F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F1F5F9',
  },
  complaintForm: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  complaintFormContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  complaintInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 24,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
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
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  formInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  filterPicker: {
    flex: 1,
  },
  createChatButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  readOnlyInput: {
    backgroundColor: '#F1F5F9',
  },
  formPicker: {
    flex: 1,
  },
  userInfoContainer: {
    position: 'relative',
  },
  userIdText: {
    position: 'absolute',
    top: -8,
    right: 12,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    backgroundColor: 'white',
    paddingHorizontal: 4,
  },
  createSupportChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  createSupportChatButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginLeft: 8,
  },
});