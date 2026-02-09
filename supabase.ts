import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qijerfynrurfquhpehno.supabase.co/';
const supabaseAnonKey = 'sb_publishable_pJKMBcVjQKAB8yNq5QYStA_UruCBOYG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});