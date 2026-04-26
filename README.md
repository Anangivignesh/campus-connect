# 🎓 Campus Connect

> A unified platform for campus events, messaging, and academic life.

Campus Connect is a modern, full-stack web application designed to enhance campus life by providing students, faculty, and administrators with seamless communication, event management, and calendar integration.

## ✨ Features

### 💬 Real-Time Messaging
- **Direct Messages & Group Chats** with role-based permissions (admin/member)
- **Read Receipts** with visual indicators (⚪ sent, 🔵 read)
- **Live Search** to filter conversations
- **Responsive Layout** optimized for desktop and mobile

### 📅 Campus Event Management
- **Event Discovery** across 4 categories: Academic, Social, Club, Workshop
- **Smart RSVP System** with capacity tracking and automatic waitlist management
- **Waitlist Promotion** - cancellations automatically promote the next person
- **Visual Capacity Indicators** with real-time progress bars

### 📆 Unified Calendar
- **Hybrid View** merging personal events with RSVP'd campus events
- **Multiple Views** - Month, Week, and Day layouts
- **Color-Coded Events** for easy visual distinction
- **Event Management** - create, edit, and delete personal events

### 🎨 User Experience
- **Dark/Light Mode** with localStorage persistence
- **Fully Responsive** - sidebar for desktop, bottom nav for mobile
- **Notification System** with unread count tracking
- **Type-Safe** - built with strict TypeScript

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19.2 |
| **Build Tool** | Vite 8.0 |
| **Language** | TypeScript 6.0 (Strict Mode) |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui (Nova preset) |
| **State Management** | Zustand 5.0 |
| **Routing** | React Router v7 |
| **Calendar** | react-big-calendar |
| **Date Utilities** | date-fns |

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd campusconnect

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Mock Authentication

**Phase 1** uses mock authentication for frontend development:

```
Email: vignesh@gmail.com
Password: vignesh12
```

> **Note:** This will be replaced with Supabase Auth in Phase 2.

## 📁 Project Structure

```
src/
├── app/              # Application entry point & routing
├── components/       # Reusable UI components
│   ├── layout/      # Layout components (Sidebar, TopBar, etc.)
│   └── ui/          # shadcn/ui components
├── data/            # Mock data for Phase 1
├── lib/             # Utilities and constants
├── pages/           # Page components
├── stores/          # Zustand state management
├── styles/          # Global styles
└── types/           # TypeScript type definitions
```

## 🏗️ Architecture

### State Management (Zustand Stores)

- **authStore** - User authentication and profile management
- **chatStore** - Chat messages, conversations, and search
- **eventStore** - Campus events, RSVPs, and filtering
- **calendarStore** - Personal events and calendar views
- **notificationStore** - System notifications and alerts
- **uiStore** - Theme toggling and UI preferences

### Type System

All core entities are defined in `src/types/index.ts` with strict TypeScript interfaces that align with the future Supabase schema:

- User profiles with roles (student, faculty, admin, club_organizer)
- Chat types (dm, group) with member roles
- Message status tracking (sent, read)
- Event categories and RSVP statuses
- Personal events and notifications

## 🎯 Development Phases

### ✅ Phase 1: Frontend Foundation (Complete)
- React + Vite + TypeScript setup
- Tailwind CSS v4 + shadcn/ui integration
- Complete routing architecture
- Zustand state management
- Mock data simulation
- All core pages and features

### 🚧 Phase 2: Supabase Integration (Next)
- Initialize Supabase project
- Configure 8 database tables
- Set up Row Level Security (RLS) policies
- Replace mock auth with Supabase Auth
- Implement real data fetching

### 🔮 Phase 3: Real-Time Features (Future)
- Supabase Realtime channels
- Live message delivery
- Typing indicators
- Presence tracking
- Push notifications

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npm run build
```

## 📝 Known Limitations (Phase 1)

- **Data Persistence:** All state is in-memory; refreshing resets to mock data
- **Authentication:** Mock credentials only (no JWTs or sessions)
- **Real-Time:** No WebSocket connections; updates are local only

These are by design for Phase 1 and will be addressed in subsequent phases.

## 🤝 Contributing

This project follows a phased development approach. Please refer to the implementation plan and walkthrough documents for contribution guidelines.

## 📄 License

[Add your license here]

## 🔗 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Supabase](https://supabase.com/)

---

Built with ❤️ for campus communities
