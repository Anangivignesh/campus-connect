import { create } from 'zustand';
import type { CampusEvent } from '@/types';
import { MOCK_EVENTS } from '@/data/mockData';

interface EventState {
  events: CampusEvent[];
  categoryFilter: string;
  searchQuery: string;
  rsvp: (eventId: string, userId: string) => void;
  cancelRsvp: (eventId: string, userId: string) => void;
  checkIn: (eventId: string, userId: string) => void;
  setCategoryFilter: (category: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: MOCK_EVENTS,
  categoryFilter: 'all',
  searchQuery: '',

  rsvp: (eventId, userId) => {
    set((state) => ({
      events: state.events.map((e) => {
        if (e.id !== eventId) return e;
        const confirmedCount = e.rsvps.filter((r) => r.status === 'confirmed').length;
        const status = confirmedCount < e.capacity ? 'confirmed' as const : 'waitlisted' as const;
        return {
          ...e,
          rsvps: [
            ...e.rsvps,
            { event_id: eventId, user_id: userId, status, created_at: new Date().toISOString() },
          ],
        };
      }),
    }));
  },

  cancelRsvp: (eventId, userId) => {
    set((state) => ({
      events: state.events.map((e) => {
        if (e.id !== eventId) return e;
        const updatedRsvps = e.rsvps.filter((r) => r.user_id !== userId);
        // Promote first waitlisted to confirmed
        const waitlisted = updatedRsvps.find((r) => r.status === 'waitlisted');
        if (waitlisted) {
          waitlisted.status = 'confirmed';
        }
        return { ...e, rsvps: updatedRsvps };
      }),
    }));
  },

  checkIn: (eventId, userId) => {
    set((state) => ({
      events: state.events.map((e) => {
        if (e.id !== eventId) return e;
        if (e.attendance.some((a) => a.user_id === userId)) return e;
        return {
          ...e,
          attendance: [
            ...e.attendance,
            { event_id: eventId, user_id: userId, checked_in_at: new Date().toISOString() },
          ],
        };
      }),
    }));
  },

  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
