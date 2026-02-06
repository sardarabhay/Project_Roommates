import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinHousehold: (householdId: number) => void;
  leaveHousehold: (householdId: number) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinHousehold: () => {},
  leaveHousehold: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps): JSX.Element => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tokenVersion, setTokenVersion] = useState(0);

  // Listen for storage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setTokenVersion(v => v + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for token changes (for same-tab login)
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && !socket?.connected) {
        setTokenVersion(v => v + 1);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [socket]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [tokenVersion]);

  const joinHousehold = useCallback((householdId: number) => {
    if (socket && isConnected) {
      socket.emit('join-household', householdId);
    }
  }, [socket, isConnected]);

  const leaveHousehold = useCallback((householdId: number) => {
    if (socket && isConnected) {
      socket.emit('leave-household', householdId);
    }
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinHousehold, leaveHousehold }}>
      {children}
    </SocketContext.Provider>
  );
};

// Socket event types (matching backend)
export const SocketEvents = {
  // Chores
  CHORE_CREATED: 'chore:created',
  CHORE_UPDATED: 'chore:updated',
  CHORE_DELETED: 'chore:deleted',
  CHORE_CLAIMED: 'chore:claimed',
  CHORE_COMPLETED: 'chore:completed',
  
  // Expenses
  EXPENSE_CREATED: 'expense:created',
  EXPENSE_UPDATED: 'expense:updated',
  EXPENSE_DELETED: 'expense:deleted',
  EXPENSE_SETTLED: 'expense:settled',
  
  // Events
  EVENT_CREATED: 'event:created',
  EVENT_UPDATED: 'event:updated',
  EVENT_DELETED: 'event:deleted',
  EVENT_RSVP: 'event:rsvp',
  
  // Issues
  ISSUE_CREATED: 'issue:created',
  ISSUE_UPDATED: 'issue:updated',
  
  // Communication
  BULLETIN_CREATED: 'bulletin:created',
  HOUSE_RULE_CREATED: 'house-rule:created',
  
  // Household
  MEMBER_JOINED: 'household:member-joined',
  MEMBER_LEFT: 'household:member-left',
  REMOVAL_REQUEST: 'household:removal-request',
  
  // General
  NOTIFICATION: 'notification',
} as const;

// Custom hook for subscribing to socket events
export function useSocketEvent<T>(
  event: string,
  callback: (data: T) => void,
  dependencies: unknown[] = []
): void {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, ...dependencies]);
}
