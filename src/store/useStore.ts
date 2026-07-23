import { create } from 'zustand';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface StoreState {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  
  // Database tables cache
  users: any[];
  clients: any[];
  leads: any[];
  events: any[];
  packages: any[];
  bookings: any[];
  bookingEvents: any[];
  assignments: any[];
  employees: any[];
  payments: any[];
  quotations: any[];
  invoices: any[];
  albums: any[];
  deliveries: any[];
  inventory: any[];
  expenses: any[];
  auditLogs: any[];
  attendances: any[];

  loading: Record<string, boolean>;
  errors: Record<string, string>;

  // Actions
  fetchSession: () => Promise<UserSession | null>;
  logout: () => Promise<void>;
  fetchData: (model: string, queryParams?: string) => Promise<any[]>;
  createRecord: (model: string, data: any) => Promise<any>;
  updateRecord: (model: string, data: any) => Promise<any>;
  deleteRecord: (model: string, id: string) => Promise<any>;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  users: [],
  clients: [],
  leads: [],
  events: [],
  packages: [],
  bookings: [],
  bookingEvents: [],
  assignments: [],
  employees: [],
  payments: [],
  quotations: [],
  invoices: [],
  albums: [],
  deliveries: [],
  inventory: [],
  expenses: [],
  auditLogs: [],
  attendances: [],

  loading: {},
  errors: {},

  fetchSession: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.ok ? await res.json() : null;
        if (data && data.authenticated) {
          set({ user: data.user });
          return data.user;
        }
      }
    } catch (e) {
      console.error('Session fetch failed', e);
    }
    set({ user: null });
    return null;
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed', e);
    }
    set({ user: null });
    window.location.href = '/';
  },

  fetchData: async (model, queryParams = '') => {
    const modelKey = model.toLowerCase();
    set((state) => ({ 
      loading: { ...state.loading, [modelKey]: true },
      errors: { ...state.errors, [modelKey]: '' }
    }));

    try {
      const res = await fetch(`/api/data/${modelKey}${queryParams}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to fetch ${model}`);
      }
      const data = await res.json();
      
      set((state) => {
        const pluralKey = modelKey === 'event' ? 'events' : modelKey;
        // Map backend model endpoint names to Zustand plural state keys
        const stateKeyMap: Record<string, string> = {
          users: 'users',
          clients: 'clients',
          leads: 'leads',
          events: 'events',
          packages: 'packages',
          bookings: 'bookings',
          bookingevents: 'bookingEvents',
          assignments: 'assignments',
          employees: 'employees',
          payments: 'payments',
          quotations: 'quotations',
          invoices: 'invoices',
          albums: 'albums',
          deliveries: 'deliveries',
          inventory: 'inventory',
          expenses: 'expenses',
          auditlogs: 'auditLogs',
          attendances: 'attendances',
        };
        const mappedKey = stateKeyMap[pluralKey] || pluralKey;
        return {
          [mappedKey]: data,
          loading: { ...state.loading, [modelKey]: false }
        };
      });
      return data;
    } catch (err: any) {
      console.error(`Fetch error for ${modelKey}:`, err);
      set((state) => ({
        loading: { ...state.loading, [modelKey]: false },
        errors: { ...state.errors, [modelKey]: err.message || 'Error occurred' }
      }));
      return [];
    }
  },

  createRecord: async (model, data) => {
    const modelKey = model.toLowerCase();
    try {
      const res = await fetch(`/api/data/${modelKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to create in ${model}`);
      }
      const created = await res.json();
      // Trigger a re-fetch of the model to keep cache fresh
      get().fetchData(model);
      return created;
    } catch (err: any) {
      console.error(`Create error for ${modelKey}:`, err);
      throw err;
    }
  },

  updateRecord: async (model, data) => {
    const modelKey = model.toLowerCase();
    try {
      const res = await fetch(`/api/data/${modelKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to update in ${model}`);
      }
      const updated = await res.json();
      // Trigger a re-fetch of the model to keep cache fresh
      get().fetchData(model);
      return updated;
    } catch (err: any) {
      console.error(`Update error for ${modelKey}:`, err);
      throw err;
    }
  },

  deleteRecord: async (model, id) => {
    const modelKey = model.toLowerCase();
    try {
      const res = await fetch(`/api/data/${modelKey}?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to delete from ${model}`);
      }
      const deleted = await res.json();
      // Trigger a re-fetch of the model to keep cache fresh
      get().fetchData(model);
      return deleted;
    } catch (err: any) {
      console.error(`Delete error for ${modelKey}:`, err);
      throw err;
    }
  },
}));
