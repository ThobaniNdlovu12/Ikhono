import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';

export type UserType = 'client' | 'professional';

export interface User {
  id: string;
  legacy_id?: number;
  full_name: string;
  email: string;
  type: UserType;
  phone: string;
  location: string;
  avatar_uri?: string;
  primary_service?: string;
  experience_years?: string;
  bio?: string;
  hourly_rate?: number;
  rating?: number;
  total_reviews?: number;
  plan?: string;
  verified?: boolean;
  auth_id?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User) => Promise<void>;
  clearUser: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,

  setUser: async (user) => {
    set({ user });
  },

  clearUser: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  loadUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        set({ user: null, session: null, isLoading: false });
        return;
      }

      const userType = session.user.user_metadata?.type;

      let profile = null;

      if (userType === 'professional') {
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();
        profile = data;
      } else {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();
        profile = data;
      }

      if (profile) {
        set({
          user: {
            id: profile.id,
            legacy_id: profile.legacy_id,
            full_name: profile.full_name,
            email: profile.email,
            type: userType,
            phone: profile.phone,
            location: profile.location,
            avatar_uri: profile.profile_picture,
            primary_service: profile.primary_service,
            experience_years: profile.experience_years,
            bio: profile.bio,
            hourly_rate: profile.hourly_rate,
            rating: profile.rating,
            total_reviews: profile.total_reviews,
            plan: profile.plan,
            verified: profile.verified,
            auth_id: session.user.id,
          },
          session,
          isLoading: false,
        });
      } else {
        set({ user: null, session: null, isLoading: false });
      }
    } catch (err) {
      set({ user: null, session: null, isLoading: false });
    }
  },
}));