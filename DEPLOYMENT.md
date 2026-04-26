# 🚀 Deployment Guide: Vercel + Supabase

This guide walks you through deploying Campus Connect to Vercel and integrating Supabase for authentication and database.

## 📋 Prerequisites

- [ ] GitHub account with the repository pushed
- [ ] Vercel account ([vercel.com](https://vercel.com))
- [ ] Supabase account ([supabase.com](https://supabase.com))
- [ ] Node.js 18+ installed locally

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Click **"New Project"**

2. **Configure Project**
   ```
   Organization: [Select or create]
   Name: campus-connect
   Database Password: [Generate strong password - SAVE THIS!]
   Region: [Choose closest to your users]
   Pricing Plan: Free (or Pro if needed)
   ```

3. **Wait for Setup**
   - Takes 2-3 minutes to provision
   - Note your project URL: `https://xxxxx.supabase.co`

### Step 2: Get API Keys

1. **Navigate to Project Settings**
   - Click the ⚙️ gear icon (bottom left)
   - Go to **API** section

2. **Copy These Values** (you'll need them later):
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (keep secret!)
   ```

### Step 3: Create Database Schema

1. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **"New Query"**

2. **Run This SQL Script** (copy and paste):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CHATS TABLE
-- ============================================
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('dm', 'group')),
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  pinned_message_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

CREATE POLICY "Users can create chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================
-- CHAT MEMBERS TABLE
-- ============================================
CREATE TABLE chat_members (
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('member', 'admin')) DEFAULT 'member',
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

CREATE POLICY "Chat admins can add members"
  ON chat_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chat_members.chat_id
      AND chat_members.user_id = auth.uid()
      AND chat_members.role = 'admin'
    )
  );

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'read'))
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

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
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
  );

-- ============================================
-- MESSAGE READS TABLE
-- ============================================
CREATE TABLE message_reads (
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view message reads in their chats"
  ON message_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reads.message_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON message_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CAMPUS EVENTS TABLE
-- ============================================
CREATE TABLE campus_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'social', 'club', 'workshop')),
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_date ON campus_events(date);
CREATE INDEX idx_events_category ON campus_events(category);

ALTER TABLE campus_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON campus_events FOR SELECT
  USING (true);

CREATE POLICY "Organizers can create events"
  ON campus_events FOR INSERT
  WITH CHECK (
    auth.uid() = organizer_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('club_organizer', 'admin', 'faculty')
    )
  );

CREATE POLICY "Organizers can update their events"
  ON campus_events FOR UPDATE
  USING (auth.uid() = organizer_id);

-- ============================================
-- EVENT RSVPS TABLE
-- ============================================
CREATE TABLE event_rsvps (
  event_id UUID REFERENCES campus_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')) DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX idx_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX idx_rsvps_user_id ON event_rsvps(user_id);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all RSVPs"
  ON event_rsvps FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own RSVPs"
  ON event_rsvps FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- EVENT ATTENDANCE TABLE
-- ============================================
CREATE TABLE event_attendance (
  event_id UUID REFERENCES campus_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attendance"
  ON event_attendance FOR SELECT
  USING (true);

CREATE POLICY "Event organizers can mark attendance"
  ON event_attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campus_events
      WHERE campus_events.id = event_attendance.event_id
      AND campus_events.organizer_id = auth.uid()
    )
  );

-- ============================================
-- PERSONAL EVENTS TABLE
-- ============================================
CREATE TABLE personal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  color TEXT NOT NULL DEFAULT '#22c55e',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_personal_events_user_id ON personal_events(user_id);
CREATE INDEX idx_personal_events_start_time ON personal_events(start_time);

ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events"
  ON personal_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chat_message', 'event_reminder', 'rsvp_confirmation', 'event_update')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON campus_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_events_updated_at BEFORE UPDATE ON personal_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. **Click "Run"** - Should see "Success. No rows returned"

### Step 4: Configure Authentication

1. **Go to Authentication Settings**
   - Click **Authentication** in sidebar
   - Go to **Providers** tab

2. **Configure Email Provider**
   - **Email** should be enabled by default
   - Toggle **"Confirm email"** OFF (for development)
   - For production, keep it ON and configure email templates

3. **Configure Site URL** (important!)
   - Go to **URL Configuration** tab
   - Set **Site URL**: `http://localhost:5173` (for local dev)
   - Add **Redirect URLs**:
     ```
     http://localhost:5173/**
     https://your-app.vercel.app/**
     ```

4. **Optional: Add OAuth Providers**
   - Google, GitHub, etc.
   - Follow Supabase docs for each provider

### Step 5: Enable Realtime (Optional)

1. **Go to Database → Replication**
2. **Enable Realtime** for these tables:
   - `messages`
   - `chat_members`
   - `notifications`
   - `event_rsvps`

### Step 6: Create Test User

1. **Go to Authentication → Users**
2. **Click "Add User"**
3. **Create Test Account**:
   ```
   Email: vignesh@gmail.com
   Password: vignesh12
   Auto Confirm User: ✓ (checked)
   ```

---

## Part 2: Vercel Deployment

### Step 1: Prepare Repository

1. **Ensure code is pushed to GitHub**
   ```bash
   git add .
   git commit -m "feat: Add Vercel deployment configuration"
   git push origin main
   ```

2. **Create `vercel.json`** (optional, for custom config):
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [https://vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import Repository**
   - Click **"Add New Project"**
   - Select **"Import Git Repository"**
   - Find `campus-connect` repository
   - Click **"Import"**

3. **Configure Project**
   ```
   Project Name: campus-connect
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   Click **"Environment Variables"** and add:
   
   ```
   Name: VITE_SUPABASE_URL
   Value: https://xxxxx.supabase.co
   
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGc... (your anon key)
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Get your URL: `https://campus-connect-xxx.vercel.app`

### Step 3: Update Supabase Redirect URLs

1. **Go back to Supabase Dashboard**
2. **Authentication → URL Configuration**
3. **Add your Vercel URL**:
   ```
   https://campus-connect-xxx.vercel.app/**
   ```

---

## Part 3: Connect Frontend to Supabase

### Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 2: Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
```

### Step 3: Generate TypeScript Types

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Generate types
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### Step 4: Update Auth Store

Replace `src/stores/authStore.ts` with Supabase integration:

```typescript
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          set({ 
            user: profile as Profile, 
            isAuthenticated: true, 
            isLoading: false 
          })
          return
        }
      }
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ isLoading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          set({ user: profile as Profile, isAuthenticated: true })
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false })
      }
    })
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profile) {
          set({ 
            user: profile as Profile, 
            isAuthenticated: true, 
            isLoading: false 
          })
          return true
        }
      }
      
      set({ isLoading: false })
      return false
    } catch (error) {
      console.error('Login error:', error)
      set({ isLoading: false })
      return false
    }
  },

  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'student'
          }
        }
      })
      
      if (error) throw error
      
      set({ isLoading: false })
      return !!data.user
    } catch (error) {
      console.error('Signup error:', error)
      set({ isLoading: false })
      return false
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },

  updateProfile: async (data: Partial<Profile>) => {
    const user = get().user
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
      
      if (!error) {
        set({ user: { ...user, ...data } })
      }
    } catch (error) {
      console.error('Profile update error:', error)
    }
  },
}))
```

### Step 5: Initialize Auth in App

Update `src/app/App.tsx`:

```typescript
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)
  const isLoading = useAuthStore((s) => s.isLoading)
  
  useEffect(() => {
    initialize()
  }, [initialize])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  // ... rest of your app
}
```

### Step 6: Create Local Environment File

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Part 4: Testing

### Local Testing

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test login with your Supabase user
# Email: vignesh@gmail.com
# Password: vignesh12
```

### Production Testing

1. Visit your Vercel URL
2. Try logging in
3. Check browser console for errors
4. Verify Supabase logs in dashboard

---

## Part 5: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "feat: Add new feature"
git push origin main
# Vercel automatically deploys!
```

### Preview Deployments

- Every pull request gets a preview URL
- Test before merging to main

---

## 🔧 Troubleshooting

### Issue: "Invalid API key"
**Solution:** Check environment variables in Vercel dashboard

### Issue: "User not found after login"
**Solution:** Ensure the `handle_new_user()` trigger is created in Supabase

### Issue: "CORS errors"
**Solution:** Add your Vercel URL to Supabase allowed origins

### Issue: "Build fails on Vercel"
**Solution:** Check build logs, ensure all dependencies are in `package.json`

### Issue: "Redirect loop after login"
**Solution:** Verify redirect URLs in Supabase match your Vercel URL

---

## 📊 Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema created (8 tables)
- [ ] RLS policies enabled
- [ ] Test user created
- [ ] Supabase API keys copied
- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Supabase redirect URLs updated
- [ ] Supabase client installed (`@supabase/supabase-js`)
- [ ] Auth store updated with Supabase
- [ ] Local `.env.local` created
- [ ] Tested locally
- [ ] Deployed to Vercel
- [ ] Tested in production

---

## 🎉 You're Done!

Your Campus Connect app is now live with:
- ✅ Deployed on Vercel
- ✅ Connected to Supabase
- ✅ Real authentication
- ✅ Database persistence
- ✅ Automatic deployments

**Next Steps:**
- Migrate other stores (chat, events, calendar) to use Supabase
- Set up Realtime subscriptions
- Add more features!

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
