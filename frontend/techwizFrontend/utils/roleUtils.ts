import { UserRole } from '@/types/user';

// Функция для преобразования permission в role
export const permissionToRole = (permission: string): UserRole => {
  switch (permission) {
    case '100':
      return 'admin';
    case '010':
      return 'support';
    case '001':
      return 'master';
    default:
      return 'master';
  }
};

// Функция для преобразования role в permission
export const roleToPermission = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '100';
    case 'support':
      return '010';
    case 'master':
      return '001';
    default:
      return '001';
  }
};

// Функция для получения названия роли
export const getRoleTitle = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'Администратор';
    case 'limitedAdmin':
      return 'Ограниченный администратор';
    case 'support':
      return 'Поддержка';
    case 'master':
      return 'Мастер';
    case 'senior_master':
      return 'Старший мастер';
    case 'premium_master':
      return 'Премиум мастер';
    default:
      return `Роль: ${role}`;
  }
}; 