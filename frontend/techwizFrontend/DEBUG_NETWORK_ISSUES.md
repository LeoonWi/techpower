# Отладка проблем с сетью в Production APK

## Проблема
Авторизация не работает в собранной APK-версии, но работает в режиме отладки.

## Основные причины и решения

### 1. Android Network Security Policy
- **Проблема**: Android 9+ блокирует HTTP-трафик в production
- **Решение**: Создан expo-plugin `expo-plugins/network-security-config.js`, который автоматически создает `network_security_config.xml` при каждой сборке
- **Преимущество**: Файл не будет перезаписан при сборке, так как создается автоматически

### 2. Конфигурация приложения
- **Изменения в app.json**:
  - Добавлен `usesCleartextTraffic: true`
  - Указан `networkSecurityConfig`
  - Добавлены необходимые разрешения

### 3. Улучшенная обработка ошибок
- **Увеличен таймаут** с 10 до 30 секунд
- **Добавлено подробное логирование** для отладки
- **Улучшена обработка сетевых ошибок**

## Команды для сборки и тестирования

### Для локальной отладки:
```bash
cd frontend/techwizFrontend
npx expo start --android
```

### Для проверки работы plugin:
```bash
cd frontend/techwizFrontend
npm run test:plugin
```

### Для сборки preview APK:
```bash
cd frontend/techwizFrontend
npm run build:preview
```

### Для сборки production APK:
```bash
cd frontend/techwizFrontend
npm run build:production
```

## Проверка логов

### В production APK:
1. Подключите устройство к компьютеру
2. Откройте терминал и выполните:
```bash
adb logcat -s ReactNativeJS
```
3. Запустите приложение и попробуйте авторизоваться
4. Проверьте логи на наличие ошибок

### Ключевые логи для поиска:
- `API_BASE_URL:` - проверьте правильность URL
- `Platform.OS:` - должен быть `android`
- `Auth: sending credentials` - проверьте отправку данных
- `Auth: API response received` - проверьте получение ответа
- `HTTP Error:` - детали сетевых ошибок

## Дополнительные проверки

### 1. Проверка доступности сервера:
```bash
curl -v http://109.120.139.145:8080/auth/signin
```

### 2. Проверка из эмулятора:
```bash
adb shell curl -v http://109.120.139.145:8080/auth/signin
```

### 3. Проверка network_security_config:
- Файл создается автоматически при сборке через expo-plugin
- Содержит разрешение для IP `109.120.139.145`
- Для изменения IP-адреса сервера отредактируйте файл `expo-plugins/network-security-config.js`

## Возможные проблемы и решения

### Проблема 1: Timeout
- **Симптомы**: Запрос зависает или таймаут
- **Решение**: Увеличен таймаут до 30 секунд

### Проблема 2: CORS
- **Симптомы**: Ошибка CORS в логах
- **Решение**: Проверить настройки CORS на сервере

### Проблема 3: Network Security Policy
- **Симптомы**: "Cleartext HTTP traffic not permitted"
- **Решение**: Настроен network_security_config.xml

### Проблема 4: DNS или сетевая недоступность
- **Симптомы**: "Network error" или "ECONNREFUSED"
- **Решение**: Проверить доступность сервера

### Проблема 5: Ошибка с алиасами путей
- **Симптомы**: "Unable to resolve module @/contexts/AuthContext"
- **Решение**: Настроены babel.config.js и metro.config.js
- **Документация**: См. файл `ALIAS_PATHS_FIX.md`

### Проблема 6: "Cannot find module 'babel-plugin-module-resolver'"
- **Симптомы**: Ошибка в процессе EAS Build или Metro bundling
- **Решение**: Переместить babel-plugin-module-resolver из devDependencies в dependencies
- **Команда**: `npm install babel-plugin-module-resolver` (без --save-dev)

## Тестирование
1. Соберите APK с помощью EAS Build
2. Установите на реальное устройство
3. Подключите к логам через ADB
4. Попробуйте авторизоваться
5. Проверьте логи на наличие ошибок

## Контакты для поддержки
Если проблема не решается, предоставьте:
1. Логи из `adb logcat -s ReactNativeJS`
2. Версию Android устройства
3. Тип сборки (preview/production)
4. Результат тестирования доступности сервера 