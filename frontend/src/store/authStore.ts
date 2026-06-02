import { create } from 'zustand';
import { User } from '../services/authService';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { getCurrentUser } = await import('../services/authService');
        const user = await getCurrentUser();
        set({ user, token, isLoading: false });
      } catch (error) {
        localStorage.removeItem('token');
        set({ user: null, token: null, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  }
}));
