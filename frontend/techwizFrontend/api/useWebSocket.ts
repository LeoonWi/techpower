import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';

export const useWebSocket = (
    userId: string,
    onMessage: (msg: ChatMessage) => void
) => {
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!userId) return;
        let url = new URL("ws://localhost:8080/ws?id=${userId}");

        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            try {
                const msg: ChatMessage = JSON.parse(event.data);
                onMessage(msg);
            } catch (err) {
                console.error('Ошибка при разборе сообщения:', err);
            }
        };

        socket.onerror = (err) => {
            console.error(' WebSocket error:', err);
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            socket.close();
        };
    }, [userId, onMessage]);

    const sendMessage = (msg: ChatMessage) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        } else {
            console.warn(' WebSocket не готов для отправки');
        }
    };

    return { sendMessage };
};