import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useEventStore } from '@/stores/eventStore';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const chats = useChatStore((s) => s.chats);
  const events = useEventStore((s) => s.events);

  const totalUnread = chats.reduce((acc, c) => acc + c.unread_count, 0);
  const upcomingEvents = events
    .filter((e) => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const myRsvps = events.filter((e) =>
    e.rsvps.some((r) => r.user_id === user?.id && r.status === 'confirmed')
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-heading font-bold">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening on campus today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUnread}</p>
              <p className="text-sm text-muted-foreground">Unread messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myRsvps.length}</p>
              <p className="text-sm text-muted-foreground">My RSVPs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-heading">Upcoming Events</CardTitle>
          <Link to="/events">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          ) : (
            upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })} · {event.venue}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">{event.category}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Chats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-heading">Recent Chats</CardTitle>
          <Link to="/chats">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {chats.slice(0, 3).map((chat) => {
            const chatName = chat.type === 'dm'
              ? chat.members.find((m) => m.user_id !== user?.id)?.user_id ?? 'Unknown'
              : chat.name ?? 'Group';
            return (
              <Link key={chat.id} to={`/chats/${chat.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold">{chatName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{chatName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {chat.last_message?.content ?? 'No messages yet'}
                    </p>
                  </div>
                </div>
                {chat.unread_count > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {chat.unread_count}
                  </span>
                )}
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
