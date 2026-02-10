import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, 
  Platform, TouchableWithoutFeedback, Keyboard, LayoutAnimation, UIManager 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';

// Import our new components
import GoalsSection from './settings-tab/goals-section';
import AppPreferences from './settings-tab/preferences-section';
import SupportSection from './settings-tab/support-section';

// Enable Animation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FieldType = 'currentWeight' | 'goalWeight' | 'height' | 'nutrition' | null;

// Helper Logic
const getSuggestedRange = (heightCm: string) => {
  const h = parseFloat(heightCm);
  if (!h || isNaN(h)) return { min: 0, max: 0 };
  const heightM = h / 100;
  const minWeight = (18.5 * heightM * heightM).toFixed(1);
  const standardMax = 24.9 * heightM * heightM;
  const maxWeight = (standardMax + 20).toFixed(1);
  return { min: minWeight, max: maxWeight };
};

export default function SettingsScreen() {
  const router = useRouter();

  // --- STATE ---
  const [currentWeight, setCurrentWeight] = useState("75");
  const [goalWeight, setGoalWeight] = useState("70");
  const [height, setHeight] = useState("175"); 
  const [nutrition, setNutrition] = useState("2400");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FieldType>(null);
  const [tempValue, setTempValue] = useState("");

  // --- HANDLERS ---
  const openEditModal = (field: FieldType, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
    setModalVisible(true);
  };

  const saveEdit = () => {
    const val = parseFloat(tempValue);

    // Validation
    if (editingField === 'height') {
      if (isNaN(val) || val < 50 || val > 300) {
        Alert.alert("Invalid Height", "Please enter a valid height in cm.");
        return; 
      }
    }
    if (editingField === 'currentWeight' || editingField === 'goalWeight') {
      if (isNaN(val) || val < 30 || val > 500) {
        Alert.alert("Invalid Weight", "Please enter a valid weight in kg.");
        return; 
      }
    }
    
    // Save
    if (editingField === 'currentWeight') setCurrentWeight(tempValue);
    if (editingField === 'goalWeight') setGoalWeight(tempValue);
    if (editingField === 'height') setHeight(tempValue);
    if (editingField === 'nutrition') setNutrition(tempValue);
    
    setModalVisible(false);
    setEditingField(null);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Error Signing Out", error.message);
  };

  const { min: suggestMin, max: suggestMax } = getSuggestedRange(height);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- SECTIONS --- */}
        <GoalsSection 
          height={height}
          currentWeight={currentWeight}
          goalWeight={goalWeight}
          nutrition={nutrition}
          onEdit={openEditModal}
        />

        <AppPreferences />

        <SupportSection/>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.9 • Build 2024</Text>
      </ScrollView>

      {/* --- MODAL (Kept here to manage global state) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update {editingField}</Text>
              
              {editingField === 'nutrition' ? (
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValueText}>{Math.round(Number(tempValue))} kcal</Text>
                  <Slider
                    style={{width: '100%', height: 40}}
                    minimumValue={1200} maximumValue={6000} step={50}
                    value={Number(tempValue)}
                    onValueChange={(val) => setTempValue(val.toString())}
                    minimumTrackTintColor="#000" maximumTrackTintColor="#000" thumbTintColor="#000"
                  />
                </View>
              ) : (
                <View>
                  <TextInput 
                    style={styles.modalInput}
                    value={tempValue}
                    onChangeText={setTempValue}
                    keyboardType="numeric"
                    autoFocus={true}
                    placeholder="Enter value"
                    placeholderTextColor="#999"
                  />
                   {(editingField === 'currentWeight' || editingField === 'goalWeight') && (
                    <View style={styles.infoContainer}>
                      <Ionicons name="information-circle" size={16} color="#666" style={{marginRight: 4}}/>
                      <Text style={styles.helperText}>
                        Broad healthy range: {suggestMin}kg - {suggestMax}kg
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveEdit}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

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
  
  // Modal styles... (Copy the remaining modal styles here from previous file)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', width: '100%', maxWidth: 320, borderRadius: 16, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  modalInput: { height: 50, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 15, backgroundColor: '#f9f9f9' },
  infoContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f0f9ff', padding: 10, borderRadius: 8, marginBottom: 20 },
  helperText: { fontSize: 13, color: '#444', lineHeight: 18 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalButton: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0' },
  saveButton: { backgroundColor: '#000' },
  cancelButtonText: { color: '#000', fontWeight: '600' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  sliderContainer: { alignItems: 'center', marginBottom: 25 },
  sliderValueText: { fontSize: 32, fontWeight: '800', color: '#000', marginBottom: 15 },
});