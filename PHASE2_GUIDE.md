# 🚀 Phase 2: Supabase Integration Guide

This guide outlines the steps to migrate Campus Connect from mock data to a fully functional Supabase backend.

## 📋 Prerequisites

- [ ] Supabase account ([supabase.com](https://supabase.com))
- [ ] Node.js 18+ installed
- [ ] Phase 1 completed and tested

## 🎯 Phase 2 Objectives

1. Set up Supabase project and database schema
2. Configure Row Level Security (RLS) policies
3. Replace mock authentication with Supabase Auth
4. Implement real data fetching and mutations
5. Set up real-time subscriptions

## 📦 Step 1: Supabase Setup

### 1.1 Create Supabase Project

```bash
# Visit https://supabase.com/dashboard
# Click "New Project"
# Note your project URL and anon key
```

### 1.2 Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 1.3 Configure Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 1.4 Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

## 🗄️ Step 2: Database Schema

### 2.1 Create Tables

Run these SQL commands in Supabase SQL Editor:

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin', 'club_organizer')),
  major TEXT,
  year TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Chats Table
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('dm', 'group')),
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  pinned_message_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chats they are members of"
  ON chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chats.id
      AND chat_members.user_id = auth.uid()
    )
  );
```

#### Chat Members Table
```sql
CREATE TABLE chat_members (
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('member', 'admin')),
  is_live_viewing BOOLEAN DEFAULT false,
  PRIMARY KEY (chat_id, user_id)
);

ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat members of their chats"
  ON chat_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = chat_members.chat_id
      AND cm.user_id = auth.uid()
    )
  );
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'read'))
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chats"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their chats"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
  );
```

#### Message Reads Table
```sql
CREATE TABLE message_reads (
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
```

#### Campus Events Table
```sql
CREATE TABLE campus_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'social', 'club', 'workshop')),
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  capacity INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campus_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON campus_events FOR SELECT
  USING (true);

CREATE POLICY "Organizers can create events"
  ON campus_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('club_organizer', 'admin', 'faculty')
    )
  );
```

#### Event RSVPs Table
```sql
CREATE TABLE event_rsvps (
  event_id UUID REFERENCES campus_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all RSVPs"
  ON event_rsvps FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own RSVPs"
  ON event_rsvps FOR ALL
  USING (auth.uid() = user_id);
```

#### Event Attendance Table
```sql
CREATE TABLE event_attendance (
  event_id UUID REFERENCES campus_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
```

#### Personal Events Table
```sql
CREATE TABLE personal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events"
  ON personal_events FOR ALL
  USING (auth.uid() = user_id);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chat_message', 'event_reminder', 'rsvp_confirmation', 'event_update')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

### 2.2 Create Database Types

Generate TypeScript types from your schema:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

## 🔐 Step 3: Authentication Migration

### 3.1 Update Auth Store

Replace `src/stores/authStore.ts`:

```typescript
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profile) {
        set({ user: profile, isAuthenticated: true, isLoading: false })
        return
      }
    }
    
    set({ isLoading: false })
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error || !data.user) {
      set({ isLoading: false })
      return false
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    if (profile) {
      set({ user: profile, isAuthenticated: true, isLoading: false })
      return true
    }
    
    set({ isLoading: false })
    return false
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },

  updateProfile: async (data: Partial<Profile>) => {
    const user = get().user
    if (!user) return
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
    
    if (!error) {
      set({ user: { ...user, ...data } })
    }
  },
}))
```

### 3.2 Initialize Auth on App Load

Update `src/app/App.tsx`:

```typescript
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)
  
  useEffect(() => {
    initialize()
  }, [initialize])
  
  // ... rest of component
}
```

## 📡 Step 4: Data Fetching

### 4.1 Update Chat Store

Replace mock data loading with Supabase queries:

```typescript
// In chatStore.ts
const loadChats = async (userId: string) => {
  const { data: chats } = await supabase
    .from('chats')
    .select(`
      *,
      members:chat_members(*, profile:profiles(*)),
      last_message:messages(*)
    `)
    .order('created_at', { ascending: false })
  
  set({ chats: chats || [] })
}
```

### 4.2 Update Event Store

```typescript
// In eventStore.ts
const loadEvents = async () => {
  const { data: events } = await supabase
    .from('campus_events')
    .select(`
      *,
      rsvps:event_rsvps(*),
      attendance:event_attendance(*)
    `)
    .order('date', { ascending: true })
  
  set({ events: events || [] })
}
```

## 🔴 Step 5: Real-Time Subscriptions

### 5.1 Subscribe to New Messages

```typescript
// In chatStore.ts
const subscribeToMessages = (chatId: string) => {
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), payload.new],
          },
        }))
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
```

### 5.2 Subscribe to Presence

```typescript
const subscribeToPresence = (chatId: string, userId: string) => {
  const channel = supabase.channel(`presence:${chatId}`, {
    config: { presence: { key: userId } },
  })
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      // Update typing indicators
    })
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
```

## ✅ Step 6: Testing

### 6.1 Create Test Users

Use Supabase Auth to create test accounts:

```typescript
// In Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password)
VALUES ('test@campus.edu', crypt('password123', gen_salt('bf')));
```

### 6.2 Seed Test Data

Run seed scripts to populate initial data:

```sql
-- Insert test profiles
INSERT INTO profiles (id, name, email, role, major, year)
VALUES
  ('user-id-1', 'Test Student', 'test@campus.edu', 'student', 'Computer Science', 'Senior'),
  ('user-id-2', 'Test Faculty', 'faculty@campus.edu', 'faculty', 'Mathematics', NULL);

-- Insert test events
INSERT INTO campus_events (title, description, category, date, end_date, venue, organizer_id, capacity)
VALUES
  ('Test Workshop', 'A test workshop', 'workshop', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '2 hours', 'Room 101', 'user-id-2', 50);
```

## 🚀 Step 7: Deployment

### 7.1 Environment Variables

Set production environment variables in your hosting platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 7.2 Build and Deploy

```bash
npm run build
# Deploy dist/ folder to your hosting platform
```

## 📊 Migration Checklist

- [ ] Supabase project created
- [ ] Database schema created (8 tables)
- [ ] RLS policies configured
- [ ] Supabase client installed and configured
- [ ] Auth store migrated
- [ ] Chat store migrated
- [ ] Event store migrated
- [ ] Calendar store migrated
- [ ] Notification store migrated
- [ ] Real-time subscriptions implemented
- [ ] Test users created
- [ ] Test data seeded
- [ ] Production deployment configured

## 🐛 Common Issues

### Issue: RLS blocking queries
**Solution:** Check RLS policies and ensure user is authenticated

### Issue: Real-time not working
**Solution:** Verify Realtime is enabled in Supabase dashboard

### Issue: Type errors after migration
**Solution:** Regenerate database types with `supabase gen types`

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

Good luck with Phase 2! 🎉
