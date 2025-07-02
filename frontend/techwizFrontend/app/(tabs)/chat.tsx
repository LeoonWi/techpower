import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Send, ArrowLeft, Users, TriangleAlert as AlertTriangle, Plus } from 'lucide-react-native';

export default function ChatScreen() {
  const { user } = useAuth();
  const { chatCategories, messages, sendMessage, addComplaint, addChatCategory } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
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

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      addChatCategory({
        id: Math.random().toString(), // Replace with proper ID generation in production
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        participantCount: 0,
      });
      setNewCategory({ name: '', description: '' });
      setShowAddCategoryModal(false);
    }
  };

  // Фильтруем категории чатов в зависимости от роли
  const getAvailableCategories = () => {
    if (user?.role === 'support') {
      return chatCategories;
    }
    
    if (user?.role === 'master' || user?.role === 'premium_master') {
      return chatCategories.filter(cat => 
        cat.name === user.category || 
        cat.id === 'support' ||
        cat.id === 'senior_master'
      );
    }
    
    if (user?.role === 'senior_master') {
      return chatCategories;
    }
    
    if (user?.role === 'admin') {
      return chatCategories;
    }
    
    return chatCategories;
  };

  const availableCategories = getAvailableCategories();

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
        {user?.role === 'support' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddCategoryModal(true)}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.subtitle}>Выберите категорию для общения</Text>

      <ScrollView 
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesListContent}
        showsVerticalScrollIndicator={true}
      >
        {(user?.role === 'master' || user?.role === 'premium_master') && (
          <TouchableOpacity
            style={styles.complaintButton}
            onPress={() => setShowComplaintForm(true)}
          >
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={styles.complaintButtonText}>Подать жалобу</Text>
          </TouchableOpacity>
        )}

        {availableCategories.map((category) => (
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
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {category.description}
            </Text>
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

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Создать новую категорию чата</Text>
            <ScrollView 
              style={styles.formContainer}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Название категории</Text>
                <TextInput
                  style={styles.formInput}
                  value={newCategory.name}
                  onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
                  placeholder="Введите название категории"
                  maxLength={50}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Описание</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  value={newCategory.description}
                  onChangeText={(text) => setNewCategory({ ...newCategory, description: text })}
                  placeholder="Введите описание категории"
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />
              </View>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddCategoryModal(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, !newCategory.name.trim() && styles.submitButtonDisabled]}
                onPress={handleAddCategory}
                disabled={!newCategory.name.trim()}
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
});