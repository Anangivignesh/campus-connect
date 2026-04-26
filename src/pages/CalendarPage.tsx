import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Button } from '@/components/ui/button';
import { useCalendarStore } from '@/stores/calendarStore';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import type { CalendarEvent } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarPage() {
  const user = useAuthStore((s) => s.user);
  const { personalEvents, view, selectedDate, setView, setSelectedDate } = useCalendarStore();
  const campusEvents = useEventStore((s) => s.events);

  // Merge campus events (RSVP'd) + personal events
  const calendarEvents: CalendarEvent[] = [
    ...campusEvents
      .filter((e) => e.rsvps.some((r) => r.user_id === user?.id && r.status === 'confirmed'))
      .map((e) => ({
        id: e.id, title: e.title,
        start: new Date(e.date), end: new Date(e.end_date),
        color: '#3b82f6', type: 'campus' as const, source_id: e.id,
      })),
    ...personalEvents.map((e) => ({
      id: e.id, title: e.title,
      start: new Date(e.start_time), end: new Date(e.end_time),
      color: e.color, type: 'personal' as const, source_id: e.id,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Calendar</h1>
        <div className="flex gap-2">
          {(['month', 'week', 'day'] as const).map((v) => (
            <Button key={v} variant={view === v ? 'default' : 'outline'} size="sm" onClick={() => setView(v)} className="capitalize">{v}</Button>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-2 min-h-[600px]">
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          view={view}
          date={selectedDate}
          onView={(v) => setView(v as typeof view)}
          onNavigate={setSelectedDate}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={(event) => ({
            style: { backgroundColor: event.color, border: 'none', borderRadius: '4px', fontSize: '12px' },
          })}
        />
      </div>
    </div>
  );
}
