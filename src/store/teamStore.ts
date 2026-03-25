import { create } from 'zustand';
import { TeamMember } from '@/types';
import { apiRequest } from '@/lib/apiClient';

interface TeamState {
  members: TeamMember[];
  loading: boolean;
  fetchMembers: () => Promise<void>;
  addMember: (name: string, email: string, password: string) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>()((set, get) => ({
  members: [],
  loading: false,

  fetchMembers: async () => {
    set({ loading: true });
    try {
      const members = await apiRequest<TeamMember[]>('/api/team');
      set({ members });
    } catch (err) {
      console.error('fetchMembers error:', err);
    } finally {
      set({ loading: false });
    }
  },

  addMember: async (name, email, password) => {
    const member = await apiRequest<TeamMember>('/api/team', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    set({ members: [member, ...get().members] });
  },

  removeMember: async (id) => {
    await apiRequest(`/api/team/${id}`, { method: 'DELETE' });
    set({ members: get().members.filter((m) => m.id !== id) });
  },
}));
