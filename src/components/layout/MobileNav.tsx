import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, Calendar, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';

const navItems = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Chats', path: '/chats', icon: MessageCircle },
  { label: 'Events', path: '/events', icon: Calendar },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Profile', path: '/profile', icon: User },
];

export function MobileNav() {
  const location = useLocation();
  const totalUnread = useChatStore((s) => s.chats.reduce((acc, c) => acc + c.unread_count, 0));

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          const badge = item.label === 'Chats' && totalUnread > 0 ? totalUnread : null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-1 relative transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {badge && (
                <span className="absolute -top-1 right-0 bg-destructive text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
