'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useInboxStore, useSmsStore } from '@/stores/communications-store';
import type { CommunicationReceivedEvent } from '@/types/communication';

interface WebSocketContextValue {
  isConnected: boolean;
  subscribe: (channel: string, event: string, callback: (data: unknown) => void) => () => void;
  unsubscribe: (channel: string, event: string) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

// Get WebSocket URL from environment
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://systemsf1rst-backend-887571186773.us-central1.run.app/app/healthshield';
const WEBSOCKET_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
const DEBUG_WS = process.env.NODE_ENV === 'development';

export function WebSocketProvider({ children, enabled = true }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Map<string, Map<string, Set<(data: unknown) => void>>>>(new Map());

  const { addNewItem, fetchUnreadCount } = useInboxStore();
  const { addIncomingMessage } = useSmsStore();

  // Handle incoming communication event
  const handleCommunicationReceived = useCallback((data: CommunicationReceivedEvent) => {
    // Add to inbox
    addNewItem({
      id: data.id,
      type: data.type,
      direction: data.direction,
      lead: data.lead,
      content: data.content,
      status: data.status,
      isRead: false,
      createdAt: data.createdAt,
      metadata: data.metadata,
    });

    // If it's an inbound SMS, also add to the SMS store
    if (data.type === 'sms' && data.direction === 'inbound' && data.leadId) {
      addIncomingMessage({
        id: data.id,
        leadId: data.leadId,
        direction: 'inbound',
        content: data.content,
        status: 'received',
        createdAt: data.createdAt,
      });
    }

    // Refresh unread count
    fetchUnreadCount();
  }, [addNewItem, addIncomingMessage, fetchUnreadCount]);

  // Subscribe to a channel/event
  const subscribe = useCallback((channel: string, event: string, callback: (data: unknown) => void) => {
    if (!subscriptionsRef.current.has(channel)) {
      subscriptionsRef.current.set(channel, new Map());
    }
    const channelSubs = subscriptionsRef.current.get(channel)!;

    if (!channelSubs.has(event)) {
      channelSubs.set(event, new Set());
    }
    channelSubs.get(event)!.add(callback);

    // Send subscribe message if connected
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: { channel },
      }));
    }

    // Return unsubscribe function
    return () => {
      channelSubs.get(event)?.delete(callback);
    };
  }, []);

  // Unsubscribe from a channel/event
  const unsubscribe = useCallback((channel: string, event: string) => {
    const channelSubs = subscriptionsRef.current.get(channel);
    if (channelSubs) {
      channelSubs.delete(event);
      if (channelSubs.size === 0) {
        subscriptionsRef.current.delete(channel);
        // Send unsubscribe message
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            event: 'pusher:unsubscribe',
            data: { channel },
          }));
        }
      }
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled || !WEBSOCKET_KEY) return;

    try {
      const ws = new WebSocket(`${WEBSOCKET_URL}?protocol=7&client=js&version=8.0.0&flash=false`);

      ws.onopen = () => {
        if (DEBUG_WS) console.log('[WebSocket] Connected');
        setIsConnected(true);

        // Re-subscribe to all channels
        subscriptionsRef.current.forEach((_, channel) => {
          ws.send(JSON.stringify({
            event: 'pusher:subscribe',
            data: { channel },
          }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Handle Pusher protocol messages
          if (message.event === 'pusher:connection_established') {
            if (DEBUG_WS) console.log('[WebSocket] Connection established');
            return;
          }

          if (message.event === 'pusher:ping') {
            ws.send(JSON.stringify({ event: 'pusher:pong' }));
            return;
          }

          if (message.event === 'pusher_internal:subscription_succeeded') {
            if (DEBUG_WS) console.log('[WebSocket] Subscribed to:', message.channel);
            return;
          }

          // Handle application events
          if (message.channel && message.event) {
            const channelSubs = subscriptionsRef.current.get(message.channel);
            if (channelSubs) {
              const eventSubs = channelSubs.get(message.event);
              if (eventSubs) {
                const data = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
                eventSubs.forEach((callback) => callback(data));
              }
            }

            // Handle communication.received event on inbox channel
            if (message.event === 'communication.received') {
              const data = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
              handleCommunicationReceived(data);
            }
          }
        } catch (err) {
          if (DEBUG_WS) console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.onclose = () => {
        if (DEBUG_WS) console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        socketRef.current = null;

        // Reconnect after delay
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        if (DEBUG_WS) console.error('[WebSocket] Error:', error);
      };

      socketRef.current = ws;
    } catch (err) {
      if (DEBUG_WS) console.error('[WebSocket] Connection error:', err);
    }
  }, [enabled, handleCommunicationReceived]);

  // Initialize connection
  useEffect(() => {
    if (enabled) {
      connect();

      // Auto-subscribe to sales inbox
      subscribe('private-sales.inbox', 'communication.received', (data) => handleCommunicationReceived(data as CommunicationReceivedEvent));
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [enabled, connect, subscribe, handleCommunicationReceived]);

  const value: WebSocketContextValue = {
    isConnected,
    subscribe,
    unsubscribe,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Hook to subscribe to lead-specific updates
export function useLeadChannel(leadId: string | null) {
  const { subscribe, isConnected } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<unknown>(null);

  useEffect(() => {
    if (!leadId || !isConnected) return;

    const channel = `private-sales.lead.${leadId}`;
    const unsubscribe = subscribe(channel, 'communication.received', (data) => {
      setLastUpdate(data);
    });

    return unsubscribe;
  }, [leadId, isConnected, subscribe]);

  return lastUpdate;
}
