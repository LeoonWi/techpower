const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Добавляем поддержку алиасов
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

module.exports = config; 