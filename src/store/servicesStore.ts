import { create } from 'zustand';
import { Service } from '@/types';
import { apiRequest } from '@/lib/apiClient';

interface ServicesState {
  services: Service[];
  loading: boolean;
  fetchServices: () => Promise<void>;
  addService: (name: string) => Promise<void>;
  removeService: (id: string) => Promise<void>;
}

export const useServicesStore = create<ServicesState>()((set, get) => ({
  services: [],
  loading: false,

  fetchServices: async () => {
    set({ loading: true });
    try {
      const services = await apiRequest<Service[]>('/api/services');
      set({ services });
    } catch (err) {
      console.error('fetchServices error:', err);
    } finally {
      set({ loading: false });
    }
  },

  addService: async (name) => {
    const service = await apiRequest<Service>('/api/services', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    set({ services: [...get().services, service] });
  },

  removeService: async (id) => {
    await apiRequest(`/api/services/${id}`, { method: 'DELETE' });
    set({ services: get().services.filter((s) => s.id !== id) });
  },
}));
