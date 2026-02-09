import React from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import Statsbar from "../profile-tab/stats-bar";
import WeightChart from "../profile-tab/weight-progress";
import QuoteCard from "../profile-tab/quote-card";
import ProfileInfo from "../profile-tab/profile-info";
import DailyHabits from "../profile-tab/daily-habits";
import { useAuth } from "../context/auth";

// --- TYPES ---

export default function ProfileTab() {


  // User Data
  const User = {
    username: "FitWarrior2024",
    email: "alex.fitness@example.com",
    joinDate: "Member since 2023",
    stats: {
      weight: "75.5",
      workouts: "142",
      streak: "12",
      calories: "2,400",
    },
  };
  
  const { user } = useAuth(); // <--- Get the user data instantly!

  if (!user) return <Text>Loading...</Text>;

  // Accessing Metadata (like the username you saved during sign up)
  const username = user.user_metadata?.username || 'User';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      {/* --- HEADER SECTION --- */}
      <View style={styles.header}>

        <ProfileInfo 
        username={username}
        email = {user.email??'placeholder'}
        joinDate={User.joinDate}
        />

        {/* --- QUICK STATS GRID --- */}
        <Statsbar 

        weight = {User.stats.weight}
        workouts = {User.stats.workouts}
        streak = {User.stats.streak}/>

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
  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

});
