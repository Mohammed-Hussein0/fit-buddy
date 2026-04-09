import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { UserProfile,useUser } from './context/UserInfo';
// Your custom components
import GoalsSection from './settings-tab/goals-section';
import AppPreferences from './settings-tab/preferences-section';
import SupportSection from './settings-tab/support-section';
import SettingsEditModal from './settings-tab/modal';

// Your Global Context
 // Check this path matches your structure!

// Enable Animation on Android

export type FieldType = keyof UserProfile | null;

// ==========================================
// 1. THE CUSTOM HOOK (Logic Only)
// ==========================================
export function useSettings() {
  const { profile, updateProfile } = useUser();

  // Local UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FieldType>(null);
  const [tempValue, setTempValue] = useState("");

  const openEditModal = (field: FieldType, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
    setModalVisible(true);
  };

  const closeEditModal = () => {
    setModalVisible(false);
    setEditingField(null);
  };

  const saveEdit = async () => {
    // If it's gender, we don't need to parse float
    if (editingField === 'gender' && tempValue === "Male" || tempValue === "Female") {
      await updateProfile({ gender: tempValue });
      closeEditModal();
      return;
    }

    const val = parseFloat(tempValue);

    // Validation
    if (editingField === 'height') {
      if (isNaN(val) || val < 50 || val > 250) {
        Alert.alert("Invalid Height", "Please enter a valid height in cm.");
        return; 
      }
    }
    if (editingField === 'currentWeight') {
      if (isNaN(val) || val < 30 || val > 200) {
        Alert.alert("Invalid Weight", "Please enter a valid weight in kg.");
        return; 
      }
    }
     if (editingField === 'goalWeight') {
      if (isNaN(val) || val < 40 || val > 150) {
        Alert.alert("Invalid Weight", "Please enter a valid weight in kg.");
        return; 
      }
    }

    // Save to Global State (DB)
    if (editingField) {
      await updateProfile({ [editingField]: tempValue });
    }
    
    closeEditModal();
  };

  const getSuggestedRange = () => {
    const h = parseFloat(profile.height);
    if (!h || isNaN(h)) return { min: 0, max: 0 };
    const heightM = h / 100;
    const minWeight = (18.5 * heightM * heightM).toFixed(1);
    const standardMax = 24.9 * heightM * heightM;
    const maxWeight = (standardMax + 20).toFixed(1);
    return { min: minWeight, max: maxWeight };
  };

  return {
    profile,
    modalVisible,
    editingField,
    tempValue,
    setTempValue,
    openEditModal,
    closeEditModal,
    saveEdit,
    getSuggestedRange,
  };
}

// ==========================================
// 2. THE COMPONENT (UI Only)
// ==========================================
export default function SettingsScreen() {
  const router = useRouter();
  
  // Use the hook above to get data and functions
  const { 
    profile, 
    modalVisible, 
    editingField, 
    tempValue, 
    setTempValue, 
    openEditModal, 
    closeEditModal, 
    saveEdit, 
    getSuggestedRange 
  } = useSettings();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Error", error.message);
  };

  const { min: suggestMin, max: suggestMax } = getSuggestedRange();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Sections */}
        <GoalsSection 
          gender={profile.gender} // Pass Gender
          height={profile.height}
          currentWeight={profile.currentWeight}
          goalWeight={profile.goalWeight}
          nutrition={profile.nutrition}
          onEdit={openEditModal}
        />

        <AppPreferences />

        <SupportSection />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.9 • Build 2024</Text>
      </ScrollView>

      <SettingsEditModal
        visible={modalVisible}
        editingField={editingField}
        tempValue={tempValue}
        setTempValue={setTempValue}
        suggestMin={suggestMin}
        suggestMax={suggestMax}
        onClose={closeEditModal}
        onSave={saveEdit}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  header: { 
    flexDirection: 'row', alignItems: 'center', gap: 15, 
    paddingHorizontal: 20, paddingBottom: 10, paddingTop: 30, 
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' 
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#000' },
  backButton: { padding: 4 },
  scrollContent: { paddingBottom: 40 },
  logoutButton: { 
    marginTop: 30, backgroundColor: '#fff', paddingVertical: 16, 
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e5e5', alignItems: 'center' 
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ff3b30' },
  versionText: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 12 },
  
});