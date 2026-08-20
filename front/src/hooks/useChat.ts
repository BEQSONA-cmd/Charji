import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { Message } from '@/types/chat';
import { generateId } from '@/lib/utils';

const WS_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/ws`
    : "";

// const WS_URL = "ws://localhost:8080/chat";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const currentBotMessageRef = useRef('');

  const { sendMessage, onMessage } = useWebSocket(WS_URL);

  useEffect(() => {
    const unsubscribe = onMessage((raw) => {
      try {
        const message = JSON.parse(raw);

        if (message.type === "token") {
          currentBotMessageRef.current += message.content;
          setCurrentBotMessage(currentBotMessageRef.current);
        }

        if (message.type === "done") {
          const fullResponse = currentBotMessageRef.current;
          if (fullResponse) {
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                type: "bot",
                content: fullResponse,
                timestamp: new Date(),
              },
            ]);
          }
          // Reset both state and ref
          currentBotMessageRef.current = '';
          setCurrentBotMessage('');
        }

        if (message.type === "error") {
          console.error("WebSocket error:", message.message);
        }
      } catch (error) {
        console.error("Invalid WebSocket message:", raw);
      }
    });

    return unsubscribe;
  }, [onMessage]);

  const sendUserMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          type: "user",
          content: trimmed,
          timestamp: new Date(),
        },
      ]);

      // Clear any previous streaming content
      currentBotMessageRef.current = '';
      setCurrentBotMessage('');

      const sent = sendMessage(JSON.stringify({ type: "prompt", content: trimmed }));
      if (!sent) {
        console.error("WebSocket is not connected");
      }
    },
    [sendMessage]
  );

  return {
    messages,
    currentBotMessage,
    sendUserMessage,
    isLoading: false,
  };
}
