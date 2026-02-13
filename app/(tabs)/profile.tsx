import React from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator
} from "react-native";
import Statsbar from "../profile-tab/stats-bar";
import WeightChart from "../profile-tab/weight-progress";
import QuoteCard from "../profile-tab/quote-card";
import ProfileInfo from "../profile-tab/profile-info";
import DailyHabits from "../profile-tab/daily-habits";
import { useAuth } from "../context/auth";
import { useUser } from "../context/UserInfo";

export default function ProfileTab() {
  // 1. Get Auth User (for email/metadata) and Profile Data (for weight/height)
  const { user } = useAuth(); 
  const { profile, loading } = useUser(); 

  if (loading || !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // 2. Format the real join date from Supabase
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      {/* --- HEADER SECTION --- */}
      <View style={styles.header}>

        <ProfileInfo 
          username={user.user_metadata?.username || 'User'}
          email={user.email || ''}
          joinDate={joinDate} // <--- Now uses real date
        />

        {/* --- QUICK STATS GRID --- */}
        <Statsbar 
          // 3. Connect the LIVE weight from your settings!
          weight={profile.currentWeight} 
          
          // These are placeholders for now until we build the workout tracker
          workouts="12" 
          streak="5"   
        />

      </View>

      {/* --- CHART SECTION --- */}
      <WeightChart/>

      {/* --- DAILY HABITS --- */}
      <DailyHabits/>

      {/* --- QUOTE CARD --- */}
      <QuoteCard/>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});