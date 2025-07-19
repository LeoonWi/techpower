import { useState } from "react";
import { apiClient, Message, Chat as ApiChat } from '@/api/client';


export default function useWebSocket(userId: string ) : WebSocket {
    const url = apiClient.getWebSocketUrl()
    const websocket = new WebSocket(`${url}?id=${userId}`)

    if (websocket == null) throw "websocket equels is null"

    // Обработчик открытия соединения
    websocket.onopen = () => {
      console.log('WebSocket подключен');
    };

    // Обработчик ошибок
    websocket.onerror = (error: Event) => {
      console.error('Ошибка WebSocket:', error);
    };

    // Обработчик закрытия соединения
    websocket.onclose = () => {
      console.log('WebSocket отключен');
    };

    return websocket;
}