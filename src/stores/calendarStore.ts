import { create } from 'zustand';
import type { PersonalEvent } from '@/types';
import { MOCK_PERSONAL_EVENTS } from '@/data/mockData';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarState {
  personalEvents: PersonalEvent[];
  view: CalendarView;
  selectedDate: Date;
  createEvent: (event: Omit<PersonalEvent, 'id' | 'created_at'>) => void;
  deleteEvent: (id: string) => void;
  setView: (view: CalendarView) => void;
  setSelectedDate: (date: Date) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  personalEvents: MOCK_PERSONAL_EVENTS,
  view: 'month',
  selectedDate: new Date(),

  createEvent: (event) => {
    const newEvent: PersonalEvent = {
      ...event,
      id: `pe_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      personalEvents: [...state.personalEvents, newEvent],
    }));
  },

  deleteEvent: (id) => {
    set((state) => ({
      personalEvents: state.personalEvents.filter((e) => e.id !== id),
    }));
  },

  setView: (view) => set({ view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
