import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, Calendar, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';
import { APP_NAME } from '@/lib/constants';

const iconMap = {
  LayoutDashboard,
  MessageCircle,
  Calendar,
  CalendarDays,
  User,
} as const;

const navItems = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' as const },
  { label: 'Chats', path: '/chats', icon: 'MessageCircle' as const },
  { label: 'Events', path: '/events', icon: 'Calendar' as const },
  { label: 'Calendar', path: '/calendar', icon: 'CalendarDays' as const },
  { label: 'Profile', path: '/profile', icon: 'User' as const },
];

export function Sidebar() {
  const location = useLocation();
  const totalUnread = useChatStore((s) => s.chats.reduce((acc, c) => acc + c.unread_count, 0));

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">CC</span>
        </div>
        <span className="font-heading font-bold text-lg">{APP_NAME}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          const badge = item.label === 'Chats' && totalUnread > 0 ? totalUnread : null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {badge && (
                <span className="ml-auto bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
