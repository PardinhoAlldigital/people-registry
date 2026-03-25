import { create } from 'zustand';
import { Person } from '@/types';
import { apiRequest } from '@/lib/apiClient';

type AddPersonData = Omit<Person, 'id' | 'createdAt' | 'groupId' | 'createdById' | 'createdBy'>;

interface PeopleState {
  people: Person[];
  loading: boolean;
  fetchPeople: () => Promise<void>;
  addPerson: (data: AddPersonData) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
}

export const usePeopleStore = create<PeopleState>()((set, get) => ({
  people: [],
  loading: false,

  fetchPeople: async () => {
    set({ loading: true });
    try {
      const people = await apiRequest<Person[]>('/api/people');
      set({ people });
    } catch (err) {
      console.error('fetchPeople error:', err);
    } finally {
      set({ loading: false });
    }
  },

  addPerson: async (data) => {
    const person = await apiRequest<Person>('/api/people', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    set({ people: [person, ...get().people] });
  },

  removePerson: async (id) => {
    await apiRequest(`/api/people/${id}`, { method: 'DELETE' });
    set({ people: get().people.filter((p) => p.id !== id) });
  },
}));
