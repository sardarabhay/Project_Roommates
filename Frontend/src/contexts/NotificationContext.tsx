import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSocket, useSocketEvent, SocketEvents } from './SocketContext';
import { initializeFirebase, requestNotificationPermission as requestFcmPermission } from '../lib/firebase';
import { registerFcmToken } from '../services/notifications';

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  requestPermission: () => Promise<boolean>;
  permissionGranted: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  requestPermission: async () => false,
  permissionGranted: false,
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
  userId?: number;
  householdId?: number;
}

export const NotificationProvider = ({ children, userId, householdId }: NotificationProviderProps): JSX.Element => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const [fcmInitialized, setFcmInitialized] = useState(false);
  const { joinHousehold, isConnected } = useSocket();

  // Initialize Firebase on mount
  useEffect(() => {
    const app = initializeFirebase();
    if (app) {
      setFcmInitialized(true);
      console.log('🔥 Firebase initialized for push notifications');
    }
  }, []);

  // If permission was already granted, register FCM token
  useEffect(() => {
    const registerExistingPermission = async () => {
      if (permissionGranted && fcmInitialized) {
        try {
          const fcmToken = await requestFcmPermission();
          if (fcmToken) {
            await registerFcmToken(fcmToken);
            console.log('📱 FCM token registered on init');
          }
        } catch (error) {
          console.error('Failed to register FCM token:', error);
        }
      }
    };
    registerExistingPermission();
  }, [permissionGranted, fcmInitialized]);

  // FCM foreground messages are intentionally NOT handled here
  // Socket.io already provides real-time in-app notifications (toasts)
  // FCM is only for background/push notifications (handled by service worker)

  // Join household room when connected
  useEffect(() => {
    if (isConnected && householdId) {
      console.log('🏠 Joining household room:', householdId);
      joinHousehold(householdId);
    }
  }, [isConnected, householdId, joinHousehold]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id };
    
    console.log('🍞 Adding toast:', toast.title);
    setToasts(prev => [...prev, newToast]);

    // Note: We DON'T show browser notifications here anymore
    // Socket events = in-app toasts only
    // FCM push = browser/push notifications (handled by service worker for background)

    // Auto-remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPermissionGranted(granted);
      
      // If permission granted, also register FCM token for push notifications
      if (granted && fcmInitialized) {
        try {
          const fcmToken = await requestFcmPermission();
          if (fcmToken) {
            await registerFcmToken(fcmToken);
            console.log('📱 FCM token registered for push notifications');
          }
        } catch (fcmError) {
          console.error('Failed to register FCM token:', fcmError);
          // Still return true since browser permission was granted
        }
      }
      
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [fcmInitialized]);

  // Socket event handlers - show notifications for real-time events
  useSocketEvent<{ title: string; assignedToUser?: { name: string }; createdByUser?: { name: string } }>(
    SocketEvents.CHORE_CREATED,
    (data) => {
      console.log('📬 Received CHORE_CREATED event:', data);
      addToast({
        type: 'info',
        title: 'New Chore Added',
        message: `"${data.title}" was added${data.assignedToUser ? ` and assigned to ${data.assignedToUser.name}` : ''}`,
      });
    },
    [addToast]
  );

  useSocketEvent<{ title: string; assignedToUser?: { name: string } }>(
    SocketEvents.CHORE_COMPLETED,
    (data) => {
      addToast({
        type: 'success',
        title: 'Chore Completed! 🎉',
        message: `"${data.title}" was completed`,
      });
    },
    [addToast]
  );

  useSocketEvent<{ title: string; assignedToUser?: { name: string } }>(
    SocketEvents.CHORE_CLAIMED,
    (data) => {
      addToast({
        type: 'info',
        title: 'Chore Claimed',
        message: `${data.assignedToUser?.name || 'Someone'} claimed "${data.title}"`,
      });
    },
    [addToast]
  );

  useSocketEvent<{ description: string; totalAmount: number; paidByUser?: { name: string } }>(
    SocketEvents.EXPENSE_CREATED,
    (data) => {
      addToast({
        type: 'info',
        title: 'New Expense Added',
        message: `${data.paidByUser?.name || 'Someone'} added "${data.description}" (₹${data.totalAmount.toFixed(2)})`,
      });
    },
    [addToast]
  );

  useSocketEvent<{ title: string; date: string; createdByUser?: { name: string } }>(
    SocketEvents.EVENT_CREATED,
    (data) => {
      const eventDate = new Date(data.date).toLocaleDateString();
      addToast({
        type: 'info',
        title: 'New Event',
        message: `"${data.title}" on ${eventDate}`,
      });
    },
    [addToast]
  );

  useSocketEvent<{ title: string; reportedByUser?: { name: string } }>(
    SocketEvents.ISSUE_CREATED,
    (data) => {
      addToast({
        type: 'warning',
        title: 'Issue Reported',
        message: `${data.reportedByUser?.name || 'Someone'} reported: "${data.title}"`,
      });
    },
    [addToast]
  );

  useSocketEvent<{ content: string; postedByUser?: { name: string } }>(
    SocketEvents.BULLETIN_CREATED,
    (data) => {
      const preview = data.content.length > 50 ? data.content.substring(0, 50) + '...' : data.content;
      addToast({
        type: 'info',
        title: 'New Bulletin Post',
        message: `${data.postedByUser?.name || 'Someone'}: "${preview}"`,
      });
    },
    [addToast]
  );

  useSocketEvent<{ name: string }>(
    SocketEvents.MEMBER_JOINED,
    (data) => {
      addToast({
        type: 'success',
        title: 'New Roommate! 👋',
        message: `${data.name} joined your household`,
      });
    },
    [addToast]
  );

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast, requestPermission, permissionGranted }}>
      {children}
    </NotificationContext.Provider>
  );
};
