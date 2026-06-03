import { useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<((data: string) => void)[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = String(event.data ?? '');
      messageHandlersRef.current.forEach(handler => handler(data));
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
      return true;
    }
    return false;
  }, []);

  const onMessage = useCallback((handler: (data: string) => void) => {
    messageHandlersRef.current.push(handler);
    return () => {
      messageHandlersRef.current = messageHandlersRef.current.filter(h => h !== handler);
    };
  }, []);

  return { sendMessage, onMessage };
}
