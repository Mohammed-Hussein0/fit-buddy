import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { Session } from '@supabase/supabase-js';

// 1. Define the shape of your User Profile
export interface UserProfile {
  height: string;
  currentWeight: string;
  goalWeight: string;
  nutrition: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say'; // Added Gender
}

interface UserContextType {
  profile: UserProfile;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Default State
  const [profile, setProfile] = useState<UserProfile>({
    height: '175',
    currentWeight: '75',
    goalWeight: '70',
    nutrition: '2400',
    gender: 'Male',
  });

  // 1. Listen for Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
  }, []);

  // 2. Fetch Data from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles') // Assumes you have a 'profiles' table
        .select('height, current_weight, goal_weight, nutrition_goal, gender')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile({
          height: data.height?.toString() || '175',
          currentWeight: data.current_weight?.toString() || '75',
          goalWeight: data.goal_weight?.toString() || '70',
          nutrition: data.nutrition_goal?.toString() || '2400',
          gender: data.gender || 'Male',
        });
      }
    } catch (e) {
      console.log('Error fetching profile', e);
    } finally {
      setLoading(false);
    }
  };

  // 3. Update Data (Optimistic Update + Save to DB)
  const updateProfile = async (updates: Partial<UserProfile>) => {
    // A. Update Local State Immediately (Fast UI)
    setProfile((prev) => ({ ...prev, ...updates }));

    // B. Save to Supabase (Background)
    if (session?.user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          height: parseFloat(updates.height || profile.height),
          current_weight: parseFloat(updates.currentWeight || profile.currentWeight),
          goal_weight: parseFloat(updates.goalWeight || profile.goalWeight),
          nutrition_goal: parseFloat(updates.nutrition || profile.nutrition),
          gender: updates.gender || profile.gender,
          updated_at: new Date(),
        });

      if (error) console.log("Error saving to DB:", error);
    }
  };

  return (
    <UserContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};