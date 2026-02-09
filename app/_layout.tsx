import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../supabase'; // Check your path
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from './context/auth';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        
        // 1. Where is the user currently?
        const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

        // 2. LOGIC: REDIRECT RULES
        if (session && inAuthGroup) {
          // Rule A: Logged in users MUST go to tabs
          router.replace('/(tabs)/profile');
          
        } else if (!session && !inAuthGroup) {
          // Rule B: Guests MUST go to login (unless they are already in login/signup)
          router.replace('/login');
        }


        setInitialized(true);
      }
    );

    return () => subscription?.unsubscribe();
  }, [segments]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen 
           name="(tabs)" 
           options={{ 
             headerShown: false, 
             gestureEnabled: false // Prevents swiping back to login
           }} 
        />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </AuthProvider>
  );
}