#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { URL } = require('url');

const SERVER_URL = 'http://109.120.139.145:8080';
const TEST_ENDPOINT = '/auth/signin';

console.log('🚀 Тестирование сетевого подключения к серверу...');
console.log(`📡 Сервер: ${SERVER_URL}`);
console.log(`🔍 Тестовый endpoint: ${TEST_ENDPOINT}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function testConnection(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NetworkTest/1.0',
      },
      timeout: 30000,
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    // Отправляем тестовые данные для авторизации
    const testData = JSON.stringify({
      phone_number: '79785882272',
      password: 'qwerty',
      permission: '100'
    });

    req.write(testData);
    req.end();
  });
}

async function runTests() {
  console.log('1️⃣ Проверка доступности сервера...');
  
  try {
    const result = await testConnection(SERVER_URL + TEST_ENDPOINT);
    
    console.log('✅ Подключение установлено!');
    console.log(`📊 Статус: ${result.statusCode}`);
    console.log(`⏱️ Время ответа: измерено`);
    console.log(`📋 Заголовки:`, Object.keys(result.headers));
    
    if (result.statusCode === 200) {
      console.log('✅ Сервер отвечает корректно');
    } else if (result.statusCode === 400) {
      console.log('⚠️ Сервер отвечает с ошибкой 400 (возможно, неправильные данные)');
    } else {
      console.log(`⚠️ Неожиданный статус: ${result.statusCode}`);
    }
    
    console.log('📄 Ответ сервера:', result.data.substring(0, 200));
    
  } catch (error) {
    console.log('❌ Ошибка подключения:');
    console.log(`   Тип: ${error.name}`);
    console.log(`   Сообщение: ${error.message}`);
    console.log(`   Код: ${error.code || 'N/A'}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Возможные причины:');
      console.log('   - Сервер выключен');
      console.log('   - Неправильный адрес или порт');
      console.log('   - Брандмауэр блокирует соединение');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Возможные причины:');
      console.log('   - Проблемы с DNS');
      console.log('   - Нет интернет-соединения');
    } else if (error.message === 'Request timeout') {
      console.log('💡 Возможные причины:');
      console.log('   - Медленное соединение');
      console.log('   - Сервер не отвечает');
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁 Тестирование завершено');
  console.log('');
  console.log('💡 Для тестирования на Android устройстве:');
  console.log('   adb shell curl -v http://109.120.139.145:8080/auth/signin');
  console.log('');
  console.log('📱 Для просмотра логов Android:');
  console.log('   adb logcat -s ReactNativeJS');
}

runTests().catch(console.error); 