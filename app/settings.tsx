import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  SafeAreaView, 
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase

 } from '@/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';

// 1. REUSABLE ROW COMPONENT
// This makes adding new settings super easy and keeps code clean
const SettingsItem = ({ icon, label, value, onPress, isSwitch, onSwitch }) => (
  <TouchableOpacity 
    style={styles.itemContainer} 
    onPress={onPress}
    disabled={isSwitch} // Disable press if it's a toggle switch
  >
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color="#000" />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
    </View>
    
    <View style={styles.itemRight}>
      {value && <Text style={styles.itemValue}>{value}</Text>}
      {isSwitch ? (
        <Switch 
          value={true} // You can hook this up to state later
          onValueChange={onSwitch}
          trackColor={{ false: "#e0e0e0", true: "#000" }}
          thumbColor="#fff"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
      )}
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function SettingsScreen() {
  const router = useRouter();

const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      Alert.alert("Error Signing Out", error.message);
    }
    // No need to navigate! 
    // The listener in _layout.tsx sees the session die and moves you to Login automatically.
  };
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false, // This hides the default black bar
        }} 
      />
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* SECTION 1: GOALS & ACCOUNT */}
        <SectionHeader title="MY GOALS" />
        <View style={styles.section}>
          <SettingsItem 
            icon="body" 
            label="Current Weight" 
            value="75 kg"
            onPress={() => {}} 
          />
          <SettingsItem 
            icon="flag" 
            label="Goal Weight" 
            value="70 kg"
            onPress={() => {}} 
          />
          <SettingsItem 
            icon="restaurant" 
            label="Nutrition Goals" 
            value="2,400 kcal"
            onPress={() => {}} 
          />
          <SettingsItem 
            icon="barbell" 
            label="Workout Preferences" 
            onPress={() => {}} 
          />
        </View>

        {/* SECTION 2: APP PREFERENCES */}
        <SectionHeader title="APP SETTINGS" />
        <View style={styles.section}>
           <SettingsItem 
            icon="notifications" 
            label="Push Notifications" 
            isSwitch={true}
            onSwitch={() => {}}
          />
          <SettingsItem 
            icon="moon" 
            label="Dark Mode" 
            isSwitch={true}
            onSwitch={() => {}}
          />
          <SettingsItem 
            icon="resize" 
            label="Units" 
            value="Metric (kg, cm)"
            onPress={() => {}} 
          />
          <SettingsItem 
            icon="sync" 
            label="Apple Health Sync" 
            value="Connected"
            onPress={() => {}} 
          />
        </View>

        {/* SECTION 3: SUPPORT */}
        <SectionHeader title="SUPPORT" />
        <View style={styles.section}>
          <SettingsItem 
            icon="help-circle" 
            label="Help & FAQs" 
            onPress={() => {}} 
          />
           <SettingsItem 
            icon="shield-checkmark" 
            label="Privacy Policy" 
            onPress={() => {}} 
          />
        </View>
          <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout} // <--- Call the function here
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* LOGOUT */}
  

        <Text style={styles.versionText}>Version 1.0.2 • Build 2024</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6', // Slightly grey background for contrast
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:15,
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    textAlign:'center',
    fontWeight: '700',
    color: '#000',
  },
  backButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 20,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
  },
  // ITEM STYLES
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 15,
    color: '#8e8e93',
    marginRight: 8,
  },
  // LOGOUT
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3b30', // Standard iOS Red
  },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 12,
  },
});