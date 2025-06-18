import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Send, ArrowLeft, Users } from 'lucide-react-native';

export default function ChatScreen() {
  const { user } = useAuth();
  const { chatCategories, messages, sendMessage } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const selectedCategoryData = chatCategories.find(cat => cat.id === selectedCategory);
  const categoryMessages = messages.filter(msg => msg.category === selectedCategory);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedCategory && user) {
      sendMessage(selectedCategory, messageText.trim(), user.id, user.fullName);
      setMessageText('');
    }
  };

  if (selectedCategory) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Chat Header */}
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

          {/* Messages */}
          <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
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

          {/* Message Input */}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Чаты</Text>
        <Text style={styles.subtitle}>Выберите категорию для общения</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.categoriesList}>
        {chatCategories.map((category) => (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  categoriesList: {
    flex: 1,
  },
  categoryCard: {
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
  backButton: {
    marginRight: 16,
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
});