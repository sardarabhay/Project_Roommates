import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Firebase configuration (from Firebase Console)
// These values should be in environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function initializeFirebase(): FirebaseApp | null {
  // Check if required config is present
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase configuration not found - push notifications disabled');
    return null;
  }

  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    console.log('🔥 Firebase initialized');
    return app;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Get the FCM token
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, { vapidKey });
    
    console.log('📱 FCM Token obtained');
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: unknown) => void): (() => void) | null {
  if (!messaging) {
    return null;
  }

  return onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);
    callback(payload);
  });
}

export { app, messaging };
