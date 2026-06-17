import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { Message } from '@/types/chat';
import { generateId } from '@/lib/utils';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/chat';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const { sendMessage, onMessage } = useWebSocket(WS_URL);

  useEffect(() => {
    console.log(WS_URL);
    const unsubscribe = onMessage((data) => {
      setCurrentBotMessage((prev) => prev + data);
    });
    return unsubscribe;
  }, [onMessage]);

  const sendUserMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Save current bot message if exists
    if (currentBotMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          type: 'bot',
          content: currentBotMessage,
          timestamp: new Date(),
        },
      ]);
    }

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        type: 'user',
        content: trimmed,
        timestamp: new Date(),
      },
    ]);

    setCurrentBotMessage('');
    sendMessage(trimmed);
  }, [currentBotMessage, sendMessage]);

  return {
    messages,
    currentBotMessage,
    sendUserMessage,
    isLoading: false, // You can add loading state logic
  };
}
