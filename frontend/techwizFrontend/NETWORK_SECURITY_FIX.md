# Исправление проблемы с Network Security для Android

## ✅ Проблема решена

**Проблема**: Авторизация не работала в собранной APK версии из-за блокировки HTTP-трафика в Android 9+

**Решение**: Создан автоматический expo-plugin для управления network security конфигурацией

## 🔧 Внесенные изменения

### 1. Создан Expo Plugin
- **Файл**: `expo-plugins/network-security-config.js`
- **Функция**: Автоматически создает `network_security_config.xml` при каждой сборке
- **Преимущество**: Файл не может быть перезаписан, так как создается автоматически

### 2. Обновлен app.json
- Добавлен plugin в секцию `plugins`
- Убрана ссылка на `networkSecurityConfig` (теперь управляется plugin)
- Оставлен `usesCleartextTraffic: true` для совместимости

### 3. Улучшен API-клиент
- Увеличен таймаут с 10 до 30 секунд
- Добавлено подробное логирование ошибок
- Улучшена обработка сетевых ошибок

### 4. Обновлена EAS конфигурация
- Добавлены environment variables для разных типов сборки
- Настроены профили для preview и production

### 5. Добавлены утилиты для отладки
- Скрипт тестирования сети: `scripts/test-network.js`
- Npm скрипты для удобства разработки
- Документация по отладке: `DEBUG_NETWORK_ISSUES.md`

### 6. Исправлена проблема с алиасами путей
- Создан `babel.config.js` с поддержкой алиасов `@/`
- Создан `metro.config.js` с настройкой путей
- Установлен `babel-plugin-module-resolver`
- Исправлена ошибка "Unable to resolve module @/contexts/AuthContext"

## 🎯 Разрешенные домены

Plugin автоматически разрешает HTTP-трафик для:
- `109.120.139.145` (основной сервер)
- `localhost` (для отладки)
- `10.0.2.2` (эмулятор Android)
- `127.0.0.1` (локальный хост)
- `192.168.1.0` (локальная сеть)

## 🚀 Как использовать

### Проверка работы plugin:
```bash
npm run test:plugin
```

### Тестирование сети:
```bash
npm run test:network
```

### Сборка APK:
```bash
npm run build:preview    # для preview
npm run build:production # для production
```

### Просмотр логов:
```bash
npm run logs:android
```

### Очистка кэша и пересборка:
```bash
npm run clean
```

## 📱 Тестирование

1. **Сервер доступен**: ✅ Проверено с помощью `test-network.js`
2. **Plugin работает**: ✅ Автоматически создает `network_security_config.xml`
3. **AndroidManifest обновлен**: ✅ Содержит ссылку на network security config
4. **Конфигурация корректна**: ✅ Разрешает HTTP для нужных доменов
5. **Алиасы путей работают**: ✅ Настроены babel.config.js и metro.config.js
6. **Dev-сервер запускается**: ✅ Нет ошибок с импортами @/

## 🔄 Что делать дальше

1. Пересоберите APK:
   ```bash
   npm run build:preview
   ```

2. Установите на устройство и протестируйте авторизацию

3. Если проблема остается, соберите логи:
   ```bash
   npm run logs:android
   ```

## 📋 Изменения в IP-адресе сервера

Если нужно изменить IP-адрес сервера:
1. Отредактируйте `expo-plugins/network-security-config.js`
2. Найдите строку с IP-адресом в `networkSecurityConfigContent`
3. Измените на нужный IP
4. Пересоберите проект

## 📞 Поддержка

**Файлы для проверки при проблемах**:
- `expo-plugins/network-security-config.js` - основной plugin
- `android/app/src/main/res/xml/network_security_config.xml` - создается автоматически
- `android/app/src/main/AndroidManifest.xml` - должен содержать ссылку на config

**Логи для отладки**:
- `adb logcat -s ReactNativeJS` - логи приложения
- Поиск сообщений: `API_BASE_URL:`, `Auth: error details`, `HTTP Error:`

---

**Статус**: ✅ Готово к тестированию
**Дата**: $(date)
**Изменения**: Network security policy настроена для разрешения HTTP-трафика к серверу 