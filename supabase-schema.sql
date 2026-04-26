-- ============================================
-- CAMPUS CONNECT - SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- It will create all tables, RLS policies, and triggers

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

-- ============================================
-- CHAT MEMBERS TABLE (must be created before chats RLS)
-- ============================================
CREATE TABLE chat_members (
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('member', 'admin')) DEFAULT 'member',
  is_live_viewing BOOLEAN DEFAULT false,
  PRIMARY KEY (chat_id, user_id)
);

-- Now enable RLS on chats (after chat_members exists)
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

-- Enable RLS on chat_members
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

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see this, all tables were created successfully!
-- Next steps:
-- 1. Go to Authentication → Users
-- 2. Create a test user
-- 3. Check that all 8 tables exist in Table Editor
