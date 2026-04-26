export const APP_NAME = 'Campus Connect';
export const APP_DESCRIPTION = 'Your unified platform for campus events, messaging, and academic life.';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'Chats', path: '/chats', icon: 'MessageCircle' },
  { label: 'Events', path: '/events', icon: 'Calendar' },
  { label: 'Calendar', path: '/calendar', icon: 'CalendarDays' },
  { label: 'Profile', path: '/profile', icon: 'User' },
] as const;

export const EVENT_CATEGORIES = [
  { value: 'all', label: 'All Events' },
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'club', label: 'Club' },
  { value: 'workshop', label: 'Workshop' },
] as const;

export const CALENDAR_COLORS = {
  campus: '#3b82f6',   // blue
  personal: '#22c55e', // green
  rsvp: '#f97316',     // orange
} as const;
