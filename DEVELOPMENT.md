# 🛠️ Development Guide

This guide provides detailed information for developers working on Campus Connect.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🔐 Authentication Flow

### Phase 1 (Current - Mock Auth)

The application uses a simple mock authentication system:

```typescript
// Login credentials
Email: vignesh@gmail.com
Password: vignesh12
```

**Implementation:** `src/stores/authStore.ts`

The `login` function simulates an API call with a 500ms delay and validates against hardcoded credentials. On success, it sets the `CURRENT_USER` from mock data.

### Phase 2 (Supabase Auth - Coming Soon)

Will be replaced with:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

## 📊 State Management

Campus Connect uses **Zustand** for state management. All stores are located in `src/stores/`.

### Store Architecture

#### 1. **authStore.ts**
Manages user authentication and profile data.

```typescript
interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<Profile>) => void
}
```

#### 2. **chatStore.ts**
Handles all chat-related functionality.

```typescript
interface ChatState {
  chats: Chat[]
  messages: Record<string, Message[]>
  users: Profile[]
  activeChatId: string | null
  typingUsers: Record<string, string[]>
  searchQuery: string
  setActiveChat: (chatId: string | null) => void
  sendMessage: (chatId: string, content: string, senderId: string) => void
  markAsRead: (chatId: string, userId: string) => void
  // ... more actions
}
```

**Key Features:**
- Messages grouped by chat ID
- Read receipt tracking
- Search functionality
- Group chat creation

#### 3. **eventStore.ts**
Manages campus events and RSVPs.

```typescript
interface EventState {
  events: CampusEvent[]
  categoryFilter: string
  searchQuery: string
  rsvp: (eventId: string, userId: string) => void
  cancelRsvp: (eventId: string, userId: string) => void
  checkIn: (eventId: string, userId: string) => void
  // ... more actions
}
```

**RSVP Logic:**
- Automatically assigns 'confirmed' or 'waitlisted' status based on capacity
- Promotes first waitlisted user when someone cancels

#### 4. **calendarStore.ts**
Handles personal events and calendar views.

```typescript
interface CalendarState {
  personalEvents: PersonalEvent[]
  view: 'month' | 'week' | 'day'
  selectedDate: Date
  createEvent: (event: Omit<PersonalEvent, 'id' | 'created_at'>) => void
  deleteEvent: (id: string) => void
  // ... more actions
}
```

#### 5. **notificationStore.ts**
Manages system notifications.

```typescript
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}
```

#### 6. **uiStore.ts**
Controls UI preferences.

```typescript
interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}
```

**Theme Persistence:**
- Saves to localStorage
- Applies dark class to document root
- Initializes from localStorage on load

## 🎨 Styling System

### Tailwind CSS v4

Campus Connect uses the latest Tailwind CSS v4 with PostCSS integration.

**Configuration:** `postcss.config.js`

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### Design Tokens

All design tokens are defined in `src/styles/globals.css` using CSS custom properties:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... more tokens */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark mode overrides */
}
```

### shadcn/ui Components

14 components installed with the **Nova** preset:

- avatar, badge, button, card, dialog
- dropdown-menu, input, label, popover
- scroll-area, separator, sheet, switch
- tabs, tooltip

**Adding New Components:**

```bash
npx shadcn@latest add [component-name]
```

## 🗂️ Type System

All TypeScript types are centralized in `src/types/index.ts`.

### Core Types

#### User & Auth
```typescript
type UserRole = 'student' | 'faculty' | 'admin' | 'club_organizer'

interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  major?: string
  year?: string
  bio?: string
  avatar_url?: string
  is_online: boolean
  last_seen?: string
  created_at: string
}
```

#### Chat & Messaging
```typescript
type ChatType = 'dm' | 'group'
type MessageStatus = 'sent' | 'read'

interface Chat {
  id: string
  type: ChatType
  name?: string
  created_by: string
  members: ChatMember[]
  last_message?: Message
  unread_count: number
  // ... more fields
}

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
  status: MessageStatus
  read_by: string[]
}
```

#### Events
```typescript
type EventCategory = 'academic' | 'social' | 'club' | 'workshop'
type RSVPStatus = 'confirmed' | 'waitlisted' | 'cancelled'

interface CampusEvent {
  id: string
  title: string
  description: string
  category: EventCategory
  date: string
  end_date: string
  venue: string
  organizer_id: string
  capacity: number
  rsvps: RSVP[]
  attendance: Attendance[]
  // ... more fields
}
```

## 🧩 Component Patterns

### Layout Components

#### AppShell
Wraps all authenticated routes with:
- Sidebar (desktop)
- TopBar (all devices)
- MobileNav (mobile)
- Authentication guard

#### Responsive Navigation
```typescript
// Desktop: Sidebar (hidden on mobile)
<aside className="hidden lg:flex ...">

// Mobile: Bottom Navigation (hidden on desktop)
<nav className="lg:hidden fixed bottom-0 ...">
```

### Page Components

All pages follow a consistent structure:

```typescript
export default function PageName() {
  // 1. Zustand store hooks
  const user = useAuthStore((s) => s.user)
  const { data, actions } = useDataStore()
  
  // 2. Local state (if needed)
  const [localState, setLocalState] = useState()
  
  // 3. Derived data
  const filtered = data.filter(...)
  
  // 4. Render
  return (
    <div className="space-y-6">
      <h1>Page Title</h1>
      {/* Content */}
    </div>
  )
}
```

## 🔄 Routing

**Router Configuration:** `src/app/App.tsx`

```typescript
<Routes>
  {/* Public route */}
  <Route path="/login" element={<LoginGuard />} />
  
  {/* Protected routes */}
  <Route element={<AppShell />}>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/chats" element={<ChatsPage />} />
    <Route path="/chats/:chatId" element={<ChatsPage />} />
    <Route path="/events" element={<EventsPage />} />
    <Route path="/calendar" element={<CalendarPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>
  
  {/* 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### Route Guards

**LoginGuard:** Redirects authenticated users away from login page
**AppShell:** Redirects unauthenticated users to login page

## 📦 Mock Data

Located in `src/data/mockData.ts`, the mock data simulates the future Supabase schema:

- **6 Users** with varied roles
- **3 Chats** (2 DM, 1 group)
- **6 Messages** across conversations
- **4 Campus Events** across all categories
- **2 Personal Events**
- **3 Notifications**

### Mock Data Structure

```typescript
export const CURRENT_USER: Profile = { /* ... */ }
export const MOCK_USERS: Profile[] = [ /* ... */ ]
export const MOCK_CHATS: Chat[] = [ /* ... */ ]
export const MOCK_MESSAGES: Message[] = [ /* ... */ ]
export const MOCK_EVENTS: CampusEvent[] = [ /* ... */ ]
export const MOCK_PERSONAL_EVENTS: PersonalEvent[] = [ /* ... */ ]
export const MOCK_NOTIFICATIONS: Notification[] = [ /* ... */ ]
```

## 🎯 Best Practices

### 1. State Management
- Use Zustand for global state
- Use React state for local UI state
- Keep stores focused and single-purpose

### 2. Type Safety
- Always define types in `src/types/index.ts`
- Use strict TypeScript mode
- Avoid `any` types

### 3. Component Design
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use shadcn/ui components for consistency

### 4. Styling
- Use Tailwind utility classes
- Follow the design token system
- Maintain responsive design patterns

### 5. Performance
- Use React.memo for expensive components
- Implement proper key props in lists
- Avoid unnecessary re-renders

## 🐛 Debugging

### Common Issues

#### 1. Theme not persisting
Check localStorage in DevTools:
```javascript
localStorage.getItem('theme') // Should return 'light' or 'dark'
```

#### 2. Mock data not loading
Verify imports in store files:
```typescript
import { MOCK_DATA } from '@/data/mockData'
```

#### 3. Routes not working
Check React Router setup in `src/app/App.tsx` and ensure `BrowserRouter` wraps the app.

### Development Tools

- **React DevTools** - Component inspection
- **Redux DevTools** - Works with Zustand (enable devtools middleware)
- **Tailwind CSS IntelliSense** - VSCode extension for class autocomplete

## 📚 Additional Resources

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Router v7](https://reactrouter.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🚀 Next Steps (Phase 2)

1. Set up Supabase project
2. Create database schema (8 tables)
3. Configure Row Level Security (RLS)
4. Replace mock auth with Supabase Auth
5. Implement real data fetching
6. Add real-time subscriptions

---

Happy coding! 🎉
