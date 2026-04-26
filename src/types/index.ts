// ─── User & Auth ─────────────────────────────────────────────
export type UserRole = 'student' | 'faculty' | 'admin' | 'club_organizer';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  major?: string;
  year?: string;
  bio?: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen?: string;
  created_at: string;
}

// ─── Chat & Messaging ───────────────────────────────────────
export type ChatType = 'dm' | 'group';
export type ChatMemberRole = 'member' | 'admin';

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  avatar_url?: string;
  created_by: string;
  pinned_message_id?: string;
  created_at: string;
  // Derived / joined data
  members: ChatMember[];
  last_message?: Message;
  unread_count: number;
}

export interface ChatMember {
  chat_id: string;
  user_id: string;
  joined_at: string;
  role: ChatMemberRole;
  is_live_viewing: boolean;
}

export type MessageStatus = 'sent' | 'read';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  status: MessageStatus;
  read_by: string[];
}

// ─── Events ─────────────────────────────────────────────────
export type EventCategory = 'academic' | 'social' | 'club' | 'workshop';
export type RSVPStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  end_date: string;
  venue: string;
  organizer_id: string;
  capacity: number;
  image_url?: string;
  created_at: string;
  // Derived
  rsvps: RSVP[];
  attendance: Attendance[];
}

export interface RSVP {
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  created_at: string;
}

export interface Attendance {
  event_id: string;
  user_id: string;
  checked_in_at: string;
}

// ─── Calendar ───────────────────────────────────────────────
export interface PersonalEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  color: string;
  created_at: string;
}

// ─── Notifications ──────────────────────────────────────────
export type NotificationType =
  | 'chat_message'
  | 'event_reminder'
  | 'rsvp_confirmation'
  | 'event_update';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  reference_id?: string;
  created_at: string;
}

// ─── Calendar Event (for react-big-calendar) ────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  type: 'campus' | 'personal';
  source_id: string;
}
