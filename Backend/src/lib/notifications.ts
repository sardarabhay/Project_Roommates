import admin from 'firebase-admin';
import prisma from './prisma.js';

// Initialize Firebase Admin SDK
// You need to set FIREBASE_SERVICE_ACCOUNT_KEY environment variable
// with the JSON content of your Firebase service account key
let firebaseInitialized = false;

export function initializeFirebase(): void {
  if (firebaseInitialized) return;

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized');
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not set - push notifications disabled');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

// Send notification to a single user
export async function sendNotificationToUser(
  userId: number,
  payload: NotificationPayload
): Promise<boolean> {
  if (!firebaseInitialized) return false;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) {
      console.log(`No FCM token for user ${userId}`);
      return false;
    }

    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data,
      webpush: {
        fcmOptions: {
          link: payload.data?.link || 'http://localhost:3001',
        },
      },
    });

    console.log(`📱 Push notification sent to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send notification to user ${userId}:`, error);
    return false;
  }
}

// Send notification to all members of a household
export async function sendNotificationToHousehold(
  householdId: number,
  payload: NotificationPayload,
  excludeUserId?: number
): Promise<number> {
  if (!firebaseInitialized) return 0;

  try {
    const members = await prisma.user.findMany({
      where: {
        householdId,
        fcmToken: { not: null },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { fcmToken: true },
    });

    const tokens = members
      .map((m) => m.fcmToken)
      .filter((token): token is string => token !== null);

    if (tokens.length === 0) return 0;

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data,
      webpush: {
        fcmOptions: {
          link: payload.data?.link || 'http://localhost:3001',
        },
      },
    });

    console.log(
      `📱 Push notifications sent to household ${householdId}: ${response.successCount}/${tokens.length} successful`
    );
    return response.successCount;
  } catch (error) {
    console.error(`Failed to send notifications to household ${householdId}:`, error);
    return 0;
  }
}

// Notification templates for common events
export const NotificationTemplates = {
  choreCreated: (choreName: string, creatorName: string): NotificationPayload => ({
    title: 'New Chore Added',
    body: `${creatorName} added "${choreName}"`,
    data: { type: 'chore', action: 'created' },
  }),

  choreAssigned: (choreName: string, assigneeName: string): NotificationPayload => ({
    title: 'Chore Assigned to You',
    body: `You've been assigned "${choreName}"`,
    data: { type: 'chore', action: 'assigned' },
  }),

  choreCompleted: (choreName: string, completerName: string): NotificationPayload => ({
    title: 'Chore Completed',
    body: `${completerName} completed "${choreName}"`,
    data: { type: 'chore', action: 'completed' },
  }),

  expenseCreated: (description: string, amount: number, creatorName: string): NotificationPayload => ({
    title: 'New Expense Added',
    body: `${creatorName} added "${description}" ($${amount.toFixed(2)})`,
    data: { type: 'expense', action: 'created' },
  }),

  expenseOwed: (description: string, amount: number): NotificationPayload => ({
    title: 'You Owe Money',
    body: `You owe $${amount.toFixed(2)} for "${description}"`,
    data: { type: 'expense', action: 'owed' },
  }),

  eventCreated: (eventName: string, creatorName: string, date: string): NotificationPayload => ({
    title: 'New Event Created',
    body: `${creatorName} created "${eventName}" on ${date}`,
    data: { type: 'event', action: 'created' },
  }),

  eventReminder: (eventName: string, timeUntil: string): NotificationPayload => ({
    title: 'Event Reminder',
    body: `"${eventName}" starts ${timeUntil}`,
    data: { type: 'event', action: 'reminder' },
  }),

  issueReported: (issueTitle: string, reporterName: string): NotificationPayload => ({
    title: 'New Issue Reported',
    body: `${reporterName} reported: "${issueTitle}"`,
    data: { type: 'issue', action: 'created' },
  }),

  memberJoined: (memberName: string): NotificationPayload => ({
    title: 'New Roommate!',
    body: `${memberName} joined your household`,
    data: { type: 'household', action: 'member-joined' },
  }),

  bulletinPosted: (title: string, posterName: string): NotificationPayload => ({
    title: 'New Bulletin Post',
    body: `${posterName}: "${title}"`,
    data: { type: 'bulletin', action: 'created' },
  }),
};
