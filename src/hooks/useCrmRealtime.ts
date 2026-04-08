'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getEcho, disconnectEcho } from '@/lib/echo';
import { useHealthShieldCrmStore } from '@/stores/healthshield-crm-store';
import { useAuthStore } from '@/stores/auth-store';

interface CrmEvent {
  type: string;
  data: Record<string, unknown>;
}

export function useCrmRealtime() {
  const { user } = useAuthStore();
  const {
    fetchKPIs,
    fetchTodaySchedule,
    fetchPendingApprovals,
    fetchActiveCalls,
    fetchRecentActivity,
    startPolling,
    stopPolling,
  } = useHealthShieldCrmStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const handleCrmEvent = useCallback((event: CrmEvent) => {
    switch (event.type) {
      case 'booking.created':
      case 'booking.updated':
      case 'booking.cancelled':
        fetchKPIs();
        fetchTodaySchedule();
        fetchRecentActivity(10);
        break;
      case 'approval.new':
      case 'approval.resolved':
        fetchPendingApprovals();
        fetchRecentActivity(10);
        break;
      case 'call.started':
      case 'call.ended':
      case 'call.status':
      case 'call.status.updated':
        fetchActiveCalls();
        break;
      case 'agent.assigned':
      case 'agent.status':
        fetchTodaySchedule();
        break;
      case 'trip.started':
      case 'trip.completed':
        fetchKPIs();
        fetchTodaySchedule();
        fetchRecentActivity(10);
        break;
      case 'payment.received':
      case 'refund.processed':
        fetchKPIs();
        fetchRecentActivity(10);
        break;
      case 'activity.new':
        fetchRecentActivity(10);
        break;
    }
  }, [fetchKPIs, fetchTodaySchedule, fetchPendingApprovals, fetchActiveCalls, fetchRecentActivity]);

  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();

    if (!echo) {
      // Fallback to polling if WebSocket is not available
      startPolling(5000);
      return () => {
        stopPolling();
      };
    }

    // Subscribe to private channel for CRM events
    const channelName = `private-crm.${user.id}`;

    if (!isSubscribedRef.current) {
      const channel = echo.private(channelName)
        // Booking events
        .listen('.booking.created', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'booking.created', data });
        })
        .listen('.booking.updated', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'booking.updated', data });
        })
        .listen('.booking.cancelled', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'booking.cancelled', data });
        })
        // Approval events
        .listen('.approval.new', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'approval.new', data });
        })
        .listen('.approval.resolved', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'approval.resolved', data });
        })
        // Call events
        .listen('.call.started', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'call.started', data });
        })
        .listen('.call.ended', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'call.ended', data });
        })
        .listen('.call.status', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'call.status', data });
        })
        .listen('.call.status.updated', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'call.status.updated', data });
        })
        // Agent events
        .listen('.agent.assigned', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'agent.assigned', data });
        })
        .listen('.agent.status', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'agent.status', data });
        })
        // Trip events
        .listen('.trip.started', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'trip.started', data });
        })
        .listen('.trip.completed', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'trip.completed', data });
        })
        // Payment events
        .listen('.payment.received', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'payment.received', data });
        })
        .listen('.refund.processed', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'refund.processed', data });
        })
        // Activity
        .listen('.activity.new', (data: Record<string, unknown>) => {
          handleCrmEvent({ type: 'activity.new', data });
        });

      channelRef.current = channel;
      isSubscribedRef.current = true;
    }

    return () => {
      if (isSubscribedRef.current && channelRef.current) {
        echo.leave(channelName);
        isSubscribedRef.current = false;
        channelRef.current = null;
      }
    };
  }, [user?.id, handleCrmEvent, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectEcho();
    };
  }, []);

  return {
    isConnected: isSubscribedRef.current,
  };
}

// Simplified hook for components that just need to enable realtime
export function useEnableCrmRealtime() {
  useCrmRealtime();
}
