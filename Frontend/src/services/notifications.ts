const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Register FCM token with backend
export async function registerFcmToken(token: string): Promise<void> {
  const authToken = localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/notifications/fcm-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error('Failed to register FCM token');
  }
}

// Remove FCM token from backend (on logout)
export async function removeFcmToken(): Promise<void> {
  const authToken = localStorage.getItem('token');
  
  if (!authToken) {
    return; // Already logged out
  }

  try {
    await fetch(`${API_URL}/notifications/fcm-token`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  } catch (error) {
    console.error('Failed to remove FCM token:', error);
  }
}

// Show in-app notification toast
export function showNotificationToast(
  title: string,
  body: string,
  onClick?: () => void
): void {
  
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
    });

    if (onClick) {
      notification.onclick = onClick;
    }
  }
}

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Get current notification permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}
