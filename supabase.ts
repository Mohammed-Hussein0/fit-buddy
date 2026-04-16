import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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
export const picApi = "AQ.Ab8RN6IGtXafv1MB-nVDQ3ho1yt9-qguNpFl57JpOmRmqH1urg";
{/*

// 1. Configure Google Sign-In
GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
  // IMPORTANT: This must be the "Web Client ID" from Google Cloud Console,
  // even if you are building for iOS/Android.
  webClientId: '806306146693-h7leivotralv0nftlritp0o7gg2qi13i.apps.googleusercontent.com', 
});

// 2. The Sign-In Function
export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    

    if (userInfo.data?.idToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });
      return { data, error };
    } else {
      throw new Error('No ID token present!');
    }
  } catch (error) {
    return { error };
  }
} */}