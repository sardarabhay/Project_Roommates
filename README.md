# 🏠 HarmonyHomes

A full-stack roommate management application designed to help shared households organize their daily lives efficiently. HarmonyHomes simplifies expense tracking, chore management, event planning, and communication between roommates.

🚀 **Status**: Currently in production and actively maintained.

## 🆕 Recent Updates

- ✅ **TypeScript Migration**: Full TypeScript support for improved type safety and developer experience
- ✅ **Real-time Notifications**: Socket.io integration with browser push notifications via Firebase
- ✅ **Multi-Household Support**: Manage multiple households from a single account
- ✅ **Custom Expense Splits**: Enhanced expense splitting with percentage and custom amount options
- ✅ **Production Ready**: Deployed and running in production environment
- ✅ **Improved UX**: Better mobile navigation and responsive layouts

## ✨ Features

### 📊 Dashboard
- Overview of household activities
- Quick access to all modules
- Personal and household statistics

### 💰 Finance Management
- Track shared expenses with automatic and custom bill splitting
- Support for multiple expense categories (groceries, rent, utilities, etc.)
- Flexible split options (equal, percentage, custom amounts)
- Balance tracking between roommates
- Settle up functionality
- Detailed expense history and reporting

### 🧹 Chores Management
- Create and assign household chores
- Point-based gamification system
- Recurring task support (daily, weekly, monthly)
- Task status tracking (todo, in progress, done)
- Leaderboard for chore completion

### 📅 Events
- Plan household events and gatherings
- RSVP system (going, maybe, not going)
- Event location and date tracking

### 🔔 Real-Time Notifications
- Browser push notifications for important updates
- Firebase Cloud Messaging (FCM) integration
- Real-time updates via Socket.io
- Notifications for new expenses, chores, events, and messages
- Customizable notification preferences

### 🏘️ Multi-Household Support
- Manage multiple households from a single account
- Switch between different households seamlessly
- Separate data and members for each household
- Household-specific settings and preferences
- Bulletin board for household announcements
- Shared house rules
- Issue reporting system

### 🏢 Landlord Module
- Store landlord contact information
- Report maintenance issues
- Track issue resolution status

### 📄 Documents
- Upload and share important documents
- Document management for the household

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Socket.io Client** - Real-time communication
- **Firebase** - Push notifications and FCM integration
- **Lucide React** - Icon library
- **CSS** - Custom styling with dark mode support

### Backend
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional event-based communication
- **Prisma** - ORM for database management
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Firebase Admin SDK** - Push notifications
- **express-validator** - Request validation

## 📁 Project Structure

```
harmony-homes-organized/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.js            # Database seeding
│   │   └── migrations/        # Database migrations
│   └── src/
│       ├── index.ts           # Express server entry (TypeScript)
│       ├── lib/
│       │   └── prisma.ts      # Prisma client
│       ├── middleware/
│       │   └── auth.ts        # JWT authentication
│       ├── socket/
│       │   └── socketHandler.ts # Socket.io real-time handling
│       └── routes/            # API route handlers (TypeScript)
│           ├── auth.ts
│           ├── chores.ts
│           ├── communication.ts
│           ├── dashboard.ts
│           ├── documents.ts
│           ├── events.ts
│           ├── expenses.ts
│           ├── household.ts
│           ├── issues.ts
│           ├── landlord.ts
│           ├── notifications.ts
│           └── users.ts
│
└── Frontend/
    └── src/
        ├── App.jsx            # Main application component
        ├── main.jsx           # React entry point
        ├── components/
        │   ├── auth/          # Authentication components
        │   ├── common/        # Shared UI components
        │   ├── dashboard/     # Dashboard components
        │   ├── forms/         # Form components
        │   └── modules/       # Feature modules
        ├── hooks/             # Custom React hooks
        ├── services/          # API service layer
        ├── config/            # Configuration (Firebase, etc.)
        └── styles/            # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/harmonyhomes"
   JWT_SECRET="your-secret-key"
   PORT=3000
   FIREBASE_PROJECT_ID="your-firebase-project-id"
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"
   FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
   ```

4. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

6. (Optional) Seed the database:
   ```bash
   npm run seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with Firebase configuration:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_FIREBASE_API_KEY="your-firebase-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   VITE_FIREBASE_VAPID_KEY="your-vapid-key"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3001`

## 🔌 Real-Time Features

HarmonyHomes uses Socket.io for real-time communication:

- **Live Updates**: Changes are instantly reflected across all connected clients
- **Push Notifications**: Browser notifications for important events
- **Real-time Sync**: Expenses, chores, events, and messages update in real-time
- **Connection Status**: Visual indicators for online/offline status
- **Automatic Reconnection**: Seamless recovery from connection drops

The Socket.io server runs alongside the Express API and handles events like:
- New expense notifications
- Chore assignments and completions
- Event RSVPs
- Bulletin board updates
- Issue status changes

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `/api/auth` | Authentication (login, signup) |
| `/api/users` | User management |
| `/api/households` | Household management |
| `/api/expenses` | Expense tracking |
| `/api/chores` | Chore management |
| `/api/events` | Event planning |
| `/api/issues` | Issue reporting |
| `/api/documents` | Document management |
| `/api/landlord` | Landlord information |
| `/api/communication` | Bulletin & house rules |
| `/api/dashboard` | Dashboard statistics |
| `/api/notifications` | Notification preferences |

## 🗄️ Database Models

- **User** - Household members with authentication
- **Household** - Multi-tenant household management
- **HouseholdMember** - User-household relationships
- **Expense** - Shared expenses with splits
- **ExpenseSplit** - Individual expense allocations
- **Chore** - Household tasks with points
- **Event** - Household events with RSVPs
- **Issue** - Reported maintenance issues
- **Document** - Shared documents
- **Landlord** - Landlord contact info
- **HouseRule** - Household rules
- **BulletinPost** - Bulletin board posts
- **Notification** - User notification preferences

## 🎨 Features in Development

- [ ] Mobile responsive improvements
- [ ] Email notifications
- [ ] Recurring expense support
- [ ] Enhanced analytics and reporting
- [ ] Dark mode improvements
- [ ] File upload enhancements

## 🚀 Deployment

The application is currently deployed in production. For deployment:

### Backend Deployment
1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Run database migrations:
   ```bash
   npm run prisma:migrate:deploy
   ```

3. Start the production server:
   ```bash
   npm start
   ```

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```

2. The `dist` folder contains the production-ready static files

### Environment Variables
Ensure all required environment variables are set in your production environment:
- Database connection (PostgreSQL)
- JWT secret
- Firebase credentials (for push notifications)
- CORS settings 

## 📜 Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload (TypeScript) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run seed` | Seed the database |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:migrate:deploy` | Deploy migrations to production |
| `npm run prisma:studio` | Open Prisma Studio |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.



---

Made with ❤️ for better roommate harmony
