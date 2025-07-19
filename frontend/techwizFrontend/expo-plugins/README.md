# Expo Plugins

## network-security-config.js

Этот plugin автоматически создает файл `network_security_config.xml` при каждой сборке Android приложения.

### Назначение

- **Проблема**: Android 9+ блокирует HTTP-трафик в production сборках
- **Решение**: Разрешает HTTP-соединения к указанным доменам
- **Преимущество**: Файл не может быть случайно перезаписан при сборке

### Как работает

1. При выполнении `expo prebuild` или `eas build` plugin автоматически:
   - Создает файл `android/app/src/main/res/xml/network_security_config.xml`
   - Добавляет в AndroidManifest.xml ссылку на этот файл
   - Настраивает разрешения для HTTP-трафика

2. Разрешенные домены:
   - `109.120.139.145` (основной сервер)
   - `localhost` (для отладки)
   - `10.0.2.2` (эмулятор Android)
   - `127.0.0.1` (локальный хост)
   - `192.168.1.0` (локальная сеть)

### Как изменить конфигурацию

Для изменения IP-адреса сервера:

1. Откройте файл `expo-plugins/network-security-config.js`
2. Найдите строку с IP-адресом в `networkSecurityConfigContent`
3. Измените IP-адрес на нужный
4. Пересоберите проект

### Тестирование

Для проверки работы plugin:

```bash
npm run test:plugin
```

Эта команда запустит `expo prebuild` и покажет сообщение о создании файла.

### Файлы

- `network-security-config.js` - основной plugin
- `README.md` - документация

### Поддержка

Если plugin не работает:
1. Проверьте, что установлена зависимость `@expo/config-plugins`
2. Убедитесь, что plugin добавлен в `app.json` в секцию `plugins`
3. Запустите `expo prebuild` для тестирования 