import type { Profile, Chat, Message, CampusEvent, PersonalEvent, Notification } from '@/types';

// ─── Users ──────────────────────────────────────────────────
export const CURRENT_USER: Profile = {
  id: 'u1',
  name: 'Vignesh Anangi',
  email: 'vignesh@gmail.com',
  role: 'student',
  major: 'Computer Science',
  year: 'Senior',
  bio: 'Full-stack developer passionate about building campus tools.',
  avatar_url: '',
  is_online: true,
  created_at: '2025-08-01T00:00:00Z',
};

export const MOCK_USERS: Profile[] = [
  CURRENT_USER,
  {
    id: 'u2', name: 'Priya Sharma', email: 'priya@campus.edu', role: 'student',
    major: 'Data Science', year: 'Junior', bio: 'AI enthusiast',
    avatar_url: '', is_online: true, created_at: '2025-08-01T00:00:00Z',
  },
  {
    id: 'u3', name: 'Arjun Patel', email: 'arjun@campus.edu', role: 'faculty',
    major: 'Mathematics', bio: 'Professor of Applied Mathematics',
    avatar_url: '', is_online: false, last_seen: '2026-04-26T08:00:00Z',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'u4', name: 'Meera Krishnan', email: 'meera@campus.edu', role: 'club_organizer',
    major: 'Design', year: 'Senior', bio: 'President of the Design Club',
    avatar_url: '', is_online: true, created_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 'u5', name: 'Rohan Gupta', email: 'rohan@campus.edu', role: 'admin',
    bio: 'Campus administrator',
    avatar_url: '', is_online: false, last_seen: '2026-04-25T18:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'u6', name: 'Ananya Reddy', email: 'ananya@campus.edu', role: 'student',
    major: 'Physics', year: 'Sophomore', bio: 'Quantum computing nerd',
    avatar_url: '', is_online: true, created_at: '2025-09-01T00:00:00Z',
  },
];

// ─── Chats ──────────────────────────────────────────────────
export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1', chat_id: 'c1', sender_id: 'u2', content: 'Hey! Are you going to the AI workshop tomorrow?',
    created_at: '2026-04-26T07:30:00Z', status: 'read', read_by: ['u1'],
  },
  {
    id: 'm2', chat_id: 'c1', sender_id: 'u1', content: 'Yes! I already RSVPd. See you there 🎉',
    created_at: '2026-04-26T07:32:00Z', status: 'sent', read_by: [],
  },
  {
    id: 'm3', chat_id: 'c2', sender_id: 'u4', content: 'Team, the design sprint is moved to Friday.',
    created_at: '2026-04-26T06:00:00Z', status: 'read', read_by: ['u1', 'u6'],
  },
  {
    id: 'm4', chat_id: 'c2', sender_id: 'u6', content: 'Works for me! 👍',
    created_at: '2026-04-26T06:05:00Z', status: 'read', read_by: ['u1', 'u4'],
  },
  {
    id: 'm5', chat_id: 'c2', sender_id: 'u1', content: 'I\'ll prepare the wireframes by Thursday.',
    created_at: '2026-04-26T06:10:00Z', status: 'sent', read_by: [],
  },
  {
    id: 'm6', chat_id: 'c3', sender_id: 'u3', content: 'Please submit your assignments by Monday.',
    created_at: '2026-04-25T14:00:00Z', status: 'read', read_by: ['u1'],
  },
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 'c1', type: 'dm', created_by: 'u2', created_at: '2026-04-20T00:00:00Z',
    members: [
      { chat_id: 'c1', user_id: 'u1', joined_at: '2026-04-20T00:00:00Z', role: 'member', is_live_viewing: false },
      { chat_id: 'c1', user_id: 'u2', joined_at: '2026-04-20T00:00:00Z', role: 'member', is_live_viewing: false },
    ],
    last_message: MOCK_MESSAGES[1],
    unread_count: 0,
  },
  {
    id: 'c2', type: 'group', name: 'Design Club', created_by: 'u4', avatar_url: '',
    created_at: '2026-03-01T00:00:00Z',
    members: [
      { chat_id: 'c2', user_id: 'u1', joined_at: '2026-03-01T00:00:00Z', role: 'member', is_live_viewing: false },
      { chat_id: 'c2', user_id: 'u4', joined_at: '2026-03-01T00:00:00Z', role: 'admin', is_live_viewing: false },
      { chat_id: 'c2', user_id: 'u6', joined_at: '2026-03-15T00:00:00Z', role: 'member', is_live_viewing: false },
    ],
    last_message: MOCK_MESSAGES[4],
    unread_count: 2,
  },
  {
    id: 'c3', type: 'dm', created_by: 'u3', created_at: '2026-01-10T00:00:00Z',
    members: [
      { chat_id: 'c3', user_id: 'u1', joined_at: '2026-01-10T00:00:00Z', role: 'member', is_live_viewing: false },
      { chat_id: 'c3', user_id: 'u3', joined_at: '2026-01-10T00:00:00Z', role: 'member', is_live_viewing: false },
    ],
    last_message: MOCK_MESSAGES[5],
    unread_count: 1,
  },
];

// ─── Events ─────────────────────────────────────────────────
export const MOCK_EVENTS: CampusEvent[] = [
  {
    id: 'e1', title: 'AI & Machine Learning Workshop', description: 'Hands-on workshop covering neural networks, NLP, and computer vision with Python.',
    category: 'workshop', date: '2026-04-28T10:00:00Z', end_date: '2026-04-28T16:00:00Z',
    venue: 'Tech Hall 301', organizer_id: 'u3', capacity: 50, created_at: '2026-04-10T00:00:00Z',
    rsvps: [
      { event_id: 'e1', user_id: 'u1', status: 'confirmed', created_at: '2026-04-15T00:00:00Z' },
      { event_id: 'e1', user_id: 'u2', status: 'confirmed', created_at: '2026-04-16T00:00:00Z' },
    ],
    attendance: [],
  },
  {
    id: 'e2', title: 'Campus Music Night', description: 'An evening of live performances by student bands and solo artists.',
    category: 'social', date: '2026-04-30T18:00:00Z', end_date: '2026-04-30T22:00:00Z',
    venue: 'Open Air Amphitheatre', organizer_id: 'u5', capacity: 200, created_at: '2026-04-12T00:00:00Z',
    rsvps: [
      { event_id: 'e2', user_id: 'u6', status: 'confirmed', created_at: '2026-04-18T00:00:00Z' },
    ],
    attendance: [],
  },
  {
    id: 'e3', title: 'Design Thinking Sprint', description: 'Collaborative design sprint to prototype solutions for campus problems.',
    category: 'club', date: '2026-05-02T09:00:00Z', end_date: '2026-05-02T17:00:00Z',
    venue: 'Innovation Lab', organizer_id: 'u4', capacity: 30, created_at: '2026-04-20T00:00:00Z',
    rsvps: [], attendance: [],
  },
  {
    id: 'e4', title: 'Advanced Calculus Review', description: 'Review session for the upcoming midterm exam.',
    category: 'academic', date: '2026-05-05T14:00:00Z', end_date: '2026-05-05T16:00:00Z',
    venue: 'Math Building 102', organizer_id: 'u3', capacity: 40, created_at: '2026-04-22T00:00:00Z',
    rsvps: [
      { event_id: 'e4', user_id: 'u1', status: 'confirmed', created_at: '2026-04-23T00:00:00Z' },
    ],
    attendance: [],
  },
];

// ─── Personal Events ────────────────────────────────────────
export const MOCK_PERSONAL_EVENTS: PersonalEvent[] = [
  {
    id: 'pe1', user_id: 'u1', title: 'Study group - Data Structures',
    description: 'Review linked lists and trees', start_time: '2026-04-27T15:00:00Z',
    end_time: '2026-04-27T17:00:00Z', color: '#22c55e', created_at: '2026-04-25T00:00:00Z',
  },
  {
    id: 'pe2', user_id: 'u1', title: 'Gym session',
    start_time: '2026-04-28T07:00:00Z', end_time: '2026-04-28T08:30:00Z',
    color: '#a855f7', created_at: '2026-04-25T00:00:00Z',
  },
];

// ─── Notifications ──────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', user_id: 'u1', type: 'rsvp_confirmation', title: 'RSVP Confirmed',
    body: 'You\'re registered for AI & Machine Learning Workshop.', is_read: true,
    reference_id: 'e1', created_at: '2026-04-15T00:00:00Z',
  },
  {
    id: 'n2', user_id: 'u1', type: 'event_reminder', title: 'Event Tomorrow',
    body: 'AI & Machine Learning Workshop starts tomorrow at 10:00 AM.',
    is_read: false, reference_id: 'e1', created_at: '2026-04-27T08:00:00Z',
  },
  {
    id: 'n3', user_id: 'u1', type: 'chat_message', title: 'New message from Priya',
    body: 'Are you going to the AI workshop tomorrow?', is_read: false,
    reference_id: 'c1', created_at: '2026-04-26T07:30:00Z',
  },
];
