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
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Send, ArrowLeft, Users, TriangleAlert as AlertTriangle, Plus, Filter, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { apiClient, Chat as ApiChat } from '@/api/client';
import { permissionToRole, getRoleTitle } from '@/utils/roleUtils';

interface User {
  id: string;
  fullName: string;
  role: string;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { chatCategories, messages, setMessages, sendMessage, addComplaint, masters } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>(user?.id || 'all');
  const [chats, setChats] = useState<ApiChat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const selectedCategoryData = chatCategories.find(cat => cat.id === selectedCategory);
  // Безопасно инициализируем chats и chatCategories, чтобы не было ошибок при null
  const safeChats = Array.isArray(chats) ? chats : [];
  const safeChatCategories = Array.isArray(chatCategories) ? chatCategories : [];

  // Исправляем фильтрацию сообщений по выбранной категории/чату
  const categoryMessages = Array.isArray(messages)
    ? messages.filter(msg => msg.chat_id === selectedCategory)
    : [];

  // Функция для загрузки чатов с сервера
  const loadChats = async () => {
    if (!user?.id) return;
    
    setIsLoadingChats(true);
    try {
      const userChats = await apiClient.getChats(user.id);
      setChats(userChats);
      console.log('Loaded chats:', userChats);
      console.log('Chat structure:', userChats.length > 0 ? userChats[0] : 'No chats');
    } catch (error) {
      console.error('Failed to load chats:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить чаты');
    } finally {
      setIsLoadingChats(false);
    }
  };

    // Функция для загрузки пользователей
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const allUsers = await apiClient.getUsers();
      if (allUsers != null) {
      const formattedUsers = allUsers.map(apiUser => ({
        id: String(apiUser.id),
        fullName: apiUser.full_name || '',
        role: permissionToRole(apiUser.permission),
      }));
      setUsers(formattedUsers);
      console.log('Loaded users:', formattedUsers);
      } else {
        console.log("Array allUsers is empty")
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Функция для удаления чата
  const handleDeleteChat = async (chatId: string) => {
    Alert.alert(
      'Удалить чат',
      'Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Удаляем чат:', chatId, 'пользователь:', user?.id);
              await apiClient.deleteChat(chatId, user?.id || '');
              // Обновляем список чатов после удаления
              await loadChats();
              Alert.alert('Успешно', 'Чат удален');
            } catch (error) {
              console.error('Ошибка при удалении чата:', error);
              Alert.alert('Ошибка', 'Не удалось удалить чат. Попробуйте еще раз.');
            }
          },
        },
      ]
    );
  };

const handleSendMessage = () => {
  sendMessage(user.id, messageText);
  setMessageText('');
};

  const handleSubmitComplaint = () => {
    if (complaintText.trim() && user && user.id && user.fullName) {
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

  const handleCreateChat = async () => {
    if (selectedUserFilter !== 'all' && selectedUserFilter !== '' && user?.id) {
      try {
        // Создаем чат через API
        const newChat = await apiClient.createChat(user.id, selectedUserFilter);
        
        // Обновляем список чатов
        await loadChats();
        
        Alert.alert(
          'Чат создан успешно', 
          `Чат создан с ID: ${newChat.id}`
        );
        
        setSelectedUserFilter('all');
        setShowCreateChatModal(false);
      } catch (error) {
        console.error('Ошибка при создании чата:', error);
        Alert.alert('Ошибка', 'Не удалось создать чат. Попробуйте еще раз.');
      }
    } else {
      Alert.alert('Ошибка', 'Выберите пользователя для создания чата');
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
        message.chat_id === category.id && 
        message.sender_id === selectedUserFilter
      );
    });
  };

  const filteredCategories = getFilteredCategories();

  // Загрузка чатов и пользователей при открытии страницы
  useEffect(() => {
    loadChats();
    loadUsers();
  }, [user?.id, masters]);

  // Загрузка сообщений для выбранного чата
  const loadMessagesForChat = async (chatId: string) => {
    try {
      const messages = await apiClient.getMessages(chatId);
      setMessages(messages);
    } catch (error) {
      setMessages([]);
      console.error('Ошибка при загрузке сообщений:', error);
    }
  };

  // Загружать сообщения при выборе чата
  useEffect(() => {
    if (selectedCategory) {
      loadMessagesForChat(selectedCategory!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

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
                    message.sender_id === user?.id && styles.myMessageContainer
                  ]}
                >
                  <View style={[
                    styles.messageBubble,
                    message.sender_id === user?.id && styles.myMessageBubble
                  ]}>
                    {/* Имя отправителя не выводим, если нет такого поля */}
                    <Text style={[
                      styles.messageText,
                      message.sender_id === user?.id && styles.myMessageText
                    ]}>
                      {message.text}
                    </Text>
                    {/* Время сообщения не выводим, если нет такого поля */}
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
            {isLoadingUsers && <Text style={styles.loadingText}>Загрузка...</Text>}
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedUserFilter}
              onValueChange={(itemValue) => setSelectedUserFilter(itemValue)}
              style={styles.filterPicker}
            >
              <Picker.Item 
                label={`Мои чаты (${user?.fullName})`} 
                value={user?.id || 'all'} 
              />
              {isLoadingUsers ? (
                <Picker.Item label="Загрузка пользователей..." value="" />
              ) : users.filter(u => u.id !== user?.id).length === 0 ? (
                <Picker.Item label="Нет доступных пользователей" value="" />
              ) : (
                users.filter(u => u.id !== user?.id).map((chatUser) => (
                  <Picker.Item 
                    key={chatUser.id} 
                    label={`Чаты ${chatUser.fullName} (${chatUser.role === 'admin' ? 'Админ' : chatUser.role === 'support' ? 'Поддержка' : 'Мастер'})`} 
                    value={chatUser.id} 
                  />
                ))
              )}
            </Picker>
          </View>
        </View>
      )}

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

        {isLoadingChats ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Загрузка чатов...</Text>
          </View>
        ) : safeChats.length === 0 ? (
          <View style={styles.emptyChatsContainer}>
            <Text style={styles.emptyChatsText}>У вас пока нет чатов</Text>
          </View>
        ) : (
          safeChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.categoryCard}
              onPress={() => setSelectedCategory(chat.id)}
              onLongPress={() => handleDeleteChat(chat.id)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>
                  {chat.name || 'Без названия'}
                </Text>
                <View style={styles.participantsBadge}>
                  <Users size={12} color="#64748B" />
                  <Text style={styles.participantsBadgeText}>
                    {Array.isArray(chat.members) ? chat.members.length : 0}
                  </Text>
                </View>
              </View>
              <View style={styles.lastMessage}>
                <Text style={styles.lastMessageText} numberOfLines={1}>
                  Участники: {Array.isArray(chat.members) ? chat.members.join(', ') : 'Нет участников'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedUserFilter}
                    onValueChange={(itemValue) => setSelectedUserFilter(itemValue)}
                    style={styles.formPicker}
                  >
                    <Picker.Item label="Выберите пользователя" value="" />
                    {isLoadingUsers ? (
                      <Picker.Item label="Загрузка пользователей..." value="" />
                    ) : users.filter(u => u.id !== user?.id).length === 0 ? (
                      <Picker.Item label="Нет доступных пользователей" value="" />
                    ) : (
                      users.filter(u => u.id !== user?.id).map((chatUser) => (
                        <Picker.Item 
                          key={chatUser.id} 
                          label={`${chatUser.fullName} (${chatUser.role === 'admin' ? 'Админ' : chatUser.role === 'support' ? 'Поддержка' : 'Мастер'})`} 
                          value={chatUser.id} 
                        />
                      ))
                    )}
                  </Picker>
                </View>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateChatModal(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, !selectedUserFilter && styles.submitButtonDisabled]}
                onPress={handleCreateChat}
                disabled={!selectedUserFilter}
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
    paddingTop: 16,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  emptyChatsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyChatsText: {
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    minHeight: 50,
  },
  filterPicker: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    height: 50,
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
    height: 50,
    color: '#1E293B',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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