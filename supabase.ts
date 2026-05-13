import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://qijerfynrurfquhpehno.supabase.co/';
const supabaseAnonKey = 'sb_publishable_pJKMBcVjQKAB8yNq5QYStA_UruCBOYG';

const getStorage = () => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  }
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return AsyncStorage;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage() as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const picApi = process.env.EXPO_PUBLIC_PIC_API_KEY ?? "";

export async function signInWithGoogle() {
  return { error: new Error('Google Sign-In is not available on this platform') };
}
