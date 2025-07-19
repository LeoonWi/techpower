# Исправление проблемы с зависимостями в EAS Build

## 🚨 Проблема
```
Cannot find module 'babel-plugin-module-resolver'
```

## ✅ Решение

### Проблема
Babel плагины и другие зависимости, используемые в процессе сборки, должны быть установлены как обычные `dependencies`, а не `devDependencies`.

### Причина
EAS Build (облачная сборка) не устанавливает `devDependencies` в production среде, поэтому плагины недоступны.

### Исправление

#### 1. Переместить babel-plugin-module-resolver:
```bash
npm uninstall babel-plugin-module-resolver
npm install babel-plugin-module-resolver
```

#### 2. Переместить @expo/config-plugins:
```bash
npm uninstall @expo/config-plugins
npm install @expo/config-plugins
```

#### 3. Проверить результат:
```bash
npm list babel-plugin-module-resolver @expo/config-plugins
```

## 📋 Правила для зависимостей

### Должны быть в `dependencies`:
- `babel-plugin-module-resolver` - используется в babel.config.js
- `@expo/config-plugins` - используется в expo-plugins
- Любые плагины, используемые в конфигурациях сборки

### Могут быть в `devDependencies`:
- TypeScript типы (`@types/*`)
- Линтеры и форматтеры
- Тестовые библиотеки
- Инструменты разработки

## 🧪 Тестирование

### Локальное тестирование:
```bash
npm run test:plugin
```

### Тестирование dev-сервера:
```bash
npm run dev
```

### Сборка APK:
```bash
npm run build:preview
```

## 🔍 Проверка package.json

Убедитесь, что в `package.json` зависимости находятся в правильных секциях:

```json
{
  "dependencies": {
    "babel-plugin-module-resolver": "^5.0.2",
    "@expo/config-plugins": "^10.1.2"
  },
  "devDependencies": {
    "@types/react": "~19.0.10",
    "typescript": "~5.8.3"
  }
}
```

## 🎯 Результат

✅ После исправления:
- Metro bundler сможет найти babel-plugin-module-resolver
- EAS Build пройдет без ошибок
- Алиасы путей будут работать корректно

---

**Дата исправления**: $(date)  
**Статус**: ✅ Исправлено 