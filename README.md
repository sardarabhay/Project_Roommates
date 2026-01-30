# 🏠 HarmonyHomes

A full-stack roommate management application designed to help shared households organize their daily lives efficiently. HarmonyHomes simplifies expense tracking, chore management, event planning, and communication between roommates.

> ⚠️ **Note**: This project is currently under active development and not yet fully completed.

## ✨ Features

### 📊 Dashboard
- Overview of household activities
- Quick access to all modules
- Personal and household statistics

### 💰 Finance Management
- Track shared expenses with automatic bill splitting
- Support for multiple expense categories (groceries, rent, utilities, etc.)
- Balance tracking between roommates
- Settle up functionality

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

### 💬 Communication
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
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **CSS** - Custom styling with dark mode support

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
harmony-homes-organized/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.js            # Database seeding
│   │   └── migrations/        # Database migrations
│   └── src/
│       ├── index.js           # Express server entry
│       ├── lib/
│       │   └── prisma.js      # Prisma client
│       ├── middleware/
│       │   └── auth.js        # JWT authentication
│       └── routes/            # API route handlers
│           ├── auth.js
│           ├── chores.js
│           ├── communication.js
│           ├── dashboard.js
│           ├── documents.js
│           ├── events.js
│           ├── expenses.js
│           ├── issues.js
│           ├── landlord.js
│           └── users.js
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

3. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3001`

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `/api/auth` | Authentication (login, signup) |
| `/api/users` | User management |
| `/api/expenses` | Expense tracking |
| `/api/chores` | Chore management |
| `/api/events` | Event planning |
| `/api/issues` | Issue reporting |
| `/api/documents` | Document management |
| `/api/landlord` | Landlord information |
| `/api/communication` | Bulletin & house rules |
| `/api/dashboard` | Dashboard statistics |

## 🗄️ Database Models

- **User** - Household members
- **Expense** - Shared expenses with splits
- **ExpenseSplit** - Individual expense allocations
- **Chore** - Household tasks
- **Event** - Household events with RSVPs
- **Issue** - Reported maintenance issues
- **Document** - Shared documents
- **Landlord** - Landlord contact info
- **HouseRule** - Household rules
- **BulletinPost** - Bulletin board posts

## 🎨 Features in Development

- [ ] Google OAuth integration
- [ ] Push notifications
- [ ] Mobile responsive improvements
- [ ] File upload functionality
- [ ] Email notifications
- [ ] Recurring expense support
- and more 

## 📜 Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm run seed` | Seed the database |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
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
