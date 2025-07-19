const { withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const networkSecurityConfigContent = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Разрешаем HTTP для конкретных доменов в debug и release -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">109.120.139.145</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">192.168.1.0</domain>
    </domain-config>
    
    <!-- Для debug сборки разрешаем все HTTP соединения -->
    <debug-overrides>
        <trust-anchors>
            <certificates src="system"/>
            <certificates src="user"/>
        </trust-anchors>
    </debug-overrides>
    
    <!-- Для всех остальных доменов используем HTTPS -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>`;

module.exports = function withNetworkSecurityConfig(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Находим application элемент
    const application = androidManifest.manifest.application?.[0];
    if (!application) {
      throw new Error('No application element found in AndroidManifest.xml');
    }

    // Добавляем или обновляем networkSecurityConfig атрибут
    if (!application.$) {
      application.$ = {};
    }
    application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    
    // Создаем директорию xml если она не существует
    const xmlDir = path.join(config.modRequest.projectRoot, 'android', 'app', 'src', 'main', 'res', 'xml');
    if (!fs.existsSync(xmlDir)) {
      fs.mkdirSync(xmlDir, { recursive: true });
    }
    
    // Записываем файл network_security_config.xml
    const xmlFilePath = path.join(xmlDir, 'network_security_config.xml');
    fs.writeFileSync(xmlFilePath, networkSecurityConfigContent);
    
    console.log('✅ Network Security Config создан:', xmlFilePath);
    
    return config;
  });
}; 