import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CurrentUser } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface AuthState {
  currentUser: CurrentUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,

      login: async (email, password) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) return { success: false, message: data.error ?? 'Erro ao fazer login.' };
          set({ currentUser: data.user, token: data.token });
          return { success: true, message: 'Login realizado com sucesso!' };
        } catch {
          return { success: false, message: 'Erro de conexão com a API.' };
        }
      },

      register: async (name, email, password) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (!res.ok) return { success: false, message: data.error ?? 'Erro ao criar conta.' };
          set({ currentUser: data.user, token: data.token });
          return { success: true, message: 'Conta criada com sucesso!' };
        } catch {
          return { success: false, message: 'Erro de conexão com a API.' };
        }
      },

      logout: () => set({ currentUser: null, token: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ currentUser: s.currentUser, token: s.token }),
    }
  )
);
