import { useEffect, useCallback, useState } from 'react';
import { useSocket, useSocketEvent, SocketEvents } from '../contexts/SocketContext';
import { initializeFirebase, requestNotificationPermission, onForegroundMessage } from '../lib/firebase';
import { registerFcmToken, showNotificationToast } from '../services/notifications';

interface UseRealtimeUpdatesOptions {
  householdId?: number;
  onChoreUpdate?: () => void;
  onExpenseUpdate?: () => void;
  onEventUpdate?: () => void;
  onIssueUpdate?: () => void;
  onCommunicationUpdate?: () => void;
  onMemberUpdate?: () => void;
}

interface RealtimeState {
  isConnected: boolean;
  notificationsEnabled: boolean;
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}): RealtimeState {
  const { 
    householdId, 
    onChoreUpdate, 
    onExpenseUpdate, 
    onEventUpdate, 
    onIssueUpdate,
    onCommunicationUpdate,
    onMemberUpdate,
  } = options;
  
  const { isConnected, joinHousehold, leaveHousehold } = useSocket();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Join household room when connected
  useEffect(() => {
    if (isConnected && householdId) {
      joinHousehold(householdId);
      
      return () => {
        leaveHousehold(householdId);
      };
    }
  }, [isConnected, householdId, joinHousehold, leaveHousehold]);

  // Initialize Firebase and request notification permission
  useEffect(() => {
    const setupNotifications = async () => {
      initializeFirebase();
      
      const token = await requestNotificationPermission();
      if (token) {
        try {
          await registerFcmToken(token);
          setNotificationsEnabled(true);
        } catch (error) {
          console.error('Failed to register FCM token:', error);
        }
      }
    };

    setupNotifications();
  }, []);

  // Handle foreground FCM messages
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload: unknown) => {
      const data = payload as { notification?: { title?: string; body?: string } };
      if (data.notification) {
        showNotificationToast(
          data.notification.title || 'HarmonyHomes',
          data.notification.body || ''
        );
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Chore events
  const handleChoreEvent = useCallback(() => {
    if (onChoreUpdate) onChoreUpdate();
  }, [onChoreUpdate]);

  useSocketEvent(SocketEvents.CHORE_CREATED, handleChoreEvent, [handleChoreEvent]);
  useSocketEvent(SocketEvents.CHORE_UPDATED, handleChoreEvent, [handleChoreEvent]);
  useSocketEvent(SocketEvents.CHORE_DELETED, handleChoreEvent, [handleChoreEvent]);
  useSocketEvent(SocketEvents.CHORE_CLAIMED, handleChoreEvent, [handleChoreEvent]);
  useSocketEvent(SocketEvents.CHORE_COMPLETED, handleChoreEvent, [handleChoreEvent]);

  // Expense events
  const handleExpenseEvent = useCallback(() => {
    if (onExpenseUpdate) onExpenseUpdate();
  }, [onExpenseUpdate]);

  useSocketEvent(SocketEvents.EXPENSE_CREATED, handleExpenseEvent, [handleExpenseEvent]);
  useSocketEvent(SocketEvents.EXPENSE_UPDATED, handleExpenseEvent, [handleExpenseEvent]);
  useSocketEvent(SocketEvents.EXPENSE_DELETED, handleExpenseEvent, [handleExpenseEvent]);
  useSocketEvent(SocketEvents.EXPENSE_SETTLED, handleExpenseEvent, [handleExpenseEvent]);

  // Event events
  const handleEventEvent = useCallback(() => {
    if (onEventUpdate) onEventUpdate();
  }, [onEventUpdate]);

  useSocketEvent(SocketEvents.EVENT_CREATED, handleEventEvent, [handleEventEvent]);
  useSocketEvent(SocketEvents.EVENT_UPDATED, handleEventEvent, [handleEventEvent]);
  useSocketEvent(SocketEvents.EVENT_DELETED, handleEventEvent, [handleEventEvent]);
  useSocketEvent(SocketEvents.EVENT_RSVP, handleEventEvent, [handleEventEvent]);

  // Issue events
  const handleIssueEvent = useCallback(() => {
    if (onIssueUpdate) onIssueUpdate();
  }, [onIssueUpdate]);

  useSocketEvent(SocketEvents.ISSUE_CREATED, handleIssueEvent, [handleIssueEvent]);
  useSocketEvent(SocketEvents.ISSUE_UPDATED, handleIssueEvent, [handleIssueEvent]);

  // Communication events
  const handleCommunicationEvent = useCallback(() => {
    if (onCommunicationUpdate) onCommunicationUpdate();
  }, [onCommunicationUpdate]);

  useSocketEvent(SocketEvents.BULLETIN_CREATED, handleCommunicationEvent, [handleCommunicationEvent]);
  useSocketEvent(SocketEvents.HOUSE_RULE_CREATED, handleCommunicationEvent, [handleCommunicationEvent]);

  // Member events
  const handleMemberEvent = useCallback(() => {
    if (onMemberUpdate) onMemberUpdate();
  }, [onMemberUpdate]);

  useSocketEvent(SocketEvents.MEMBER_JOINED, handleMemberEvent, [handleMemberEvent]);
  useSocketEvent(SocketEvents.MEMBER_LEFT, handleMemberEvent, [handleMemberEvent]);
  useSocketEvent(SocketEvents.REMOVAL_REQUEST, handleMemberEvent, [handleMemberEvent]);

  return {
    isConnected,
    notificationsEnabled,
  };
}
