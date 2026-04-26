import { create } from 'zustand';
import type { Profile } from '@/types';
import { CURRENT_USER } from '@/data/mockData';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    // Mock auth — will be replaced with Supabase in Phase 3
    await new Promise((r) => setTimeout(r, 500));
    if (email === 'vignesh@gmail.com' && password === 'vignesh12') {
      set({ user: CURRENT_USER, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ isLoading: false });
    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
}));
