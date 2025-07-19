import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface LocalUser {
  id: string;
  phone: string;
  password: string;
  role: 'admin' | 'support' | 'master';
  fullName?: string;
}

const USERS_KEY = 'localUsers';

let users: LocalUser[] = [];

async function loadUsersFromStorage() {
  if (Platform.OS === 'web') {
    const stored = window.localStorage.getItem(USERS_KEY);
    if (stored) {
      try {
        users = JSON.parse(stored);
      } catch (e) {
        users = [];
      }
    } else {
      // Демо-аккаунты по умолчанию
      users = [
        { id: '1', phone: '79001234567', password: 'admin123', role: 'admin', fullName: 'Админ' },
        { id: '2', phone: '79002345678', password: 'support123', role: 'support', fullName: 'Саппорт' },
        { id: '3', phone: '79003456789', password: 'master123', role: 'master', fullName: 'Мастер' },
      ];
      window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  } else {
    const stored = await SecureStore.getItemAsync(USERS_KEY);
    if (stored) {
      try {
        users = JSON.parse(stored);
      } catch (e) {
        users = [];
      }
    } else {
      // Демо-аккаунты по умолчанию
      users = [
        { id: '1', phone: '79001234567', password: 'admin123', role: 'admin', fullName: 'Админ' },
        { id: '2', phone: '79002345678', password: 'support123', role: 'support', fullName: 'Саппорт' },
        { id: '3', phone: '79003456789', password: 'master123', role: 'master', fullName: 'Мастер' },
      ];
      await SecureStore.setItemAsync(USERS_KEY, JSON.stringify(users));
    }
  }
}

async function saveUsersToStorage() {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } else {
    await SecureStore.setItemAsync(USERS_KEY, JSON.stringify(users));
  }
}

loadUsersFromStorage();

export function getUsers(): LocalUser[] {
  return users;
}

export function addUser(user: Omit<LocalUser, 'id'>) {
  const newUser: LocalUser = { ...user, id: Date.now().toString() };
  users.push(newUser);
  saveUsersToStorage();
}

export function findUser(phone: string, password: string): LocalUser | undefined {
  return users.find(u => u.phone === phone && u.password === password);
}

export function findUserByPhone(phone: string): LocalUser | undefined {
  return users.find(u => u.phone === phone);
} 