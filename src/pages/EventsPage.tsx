import { Search, MapPin, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { EVENT_CATEGORIES } from '@/lib/constants';
import { MOCK_USERS } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function EventsPage() {
  const user = useAuthStore((s) => s.user);
  const { events, categoryFilter, searchQuery, setCategoryFilter, setSearchQuery, rsvp, cancelRsvp } = useEventStore();

  const filtered = events.filter((e) => {
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
    const matchSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Events</h1>
        <p className="text-muted-foreground mt-1">Discover and RSVP to campus events.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {EVENT_CATEGORIES.map((cat) => (
            <Button key={cat.value} variant={categoryFilter === cat.value ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter(cat.value)}>{cat.label}</Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((event) => {
          const organizer = MOCK_USERS.find((u) => u.id === event.organizer_id);
          const confirmed = event.rsvps.filter((r) => r.status === 'confirmed').length;
          const myRsvp = event.rsvps.find((r) => r.user_id === user?.id);
          const isFull = confirmed >= event.capacity;
          return (
            <Card key={event.id} className="overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-heading font-semibold">{event.title}</h3>
                  <Badge variant="secondary" className="mt-1 capitalize text-xs">{event.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /><span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /><span>{event.venue}</span></div>
                  <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /><span>{confirmed}/{event.capacity} spots</span></div>
                </div>
                {organizer && <p className="text-xs text-muted-foreground">By <span className="font-medium text-foreground">{organizer.name}</span></p>}
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className={cn('h-1.5 rounded-full', isFull ? 'bg-destructive' : 'bg-primary')} style={{ width: `${Math.min((confirmed / event.capacity) * 100, 100)}%` }} />
                </div>
                {myRsvp && myRsvp.status !== 'cancelled' ? (
                  <div className="flex items-center gap-2">
                    <Badge variant={myRsvp.status === 'confirmed' ? 'default' : 'secondary'}>{myRsvp.status === 'confirmed' ? '✓ RSVPd' : '⏳ Waitlisted'}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => cancelRsvp(event.id, user!.id)}>Cancel</Button>
                  </div>
                ) : (
                  <Button className="w-full" variant={isFull ? 'outline' : 'default'} onClick={() => rsvp(event.id, user!.id)}>{isFull ? 'Join Waitlist' : 'RSVP Now'}</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>No events found.</p></div>}
    </div>
  );
}
