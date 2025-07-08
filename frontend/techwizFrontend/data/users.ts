export interface LocalUser {
  id: string;
  phone: string;
  password: string;
  role: 'admin' | 'support' | 'master';
  fullName?: string;
}

const USERS_KEY = 'localUsers';

let users: LocalUser[] = [];

function loadUsersFromStorage() {
  if (typeof window !== 'undefined') {
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
  }
}

function saveUsersToStorage() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
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