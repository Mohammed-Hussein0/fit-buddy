import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  SafeAreaView, 
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';

// --- TYPES ---
interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  onSwitch?: (value: boolean) => void;
}

type FieldType = 'currentWeight' | 'goalWeight' | 'height' | 'nutrition' | null;

// --- HELPER: SUGGESTED RANGE CALCULATOR ---
// Logic: Standard BMI Min (18.5) to Standard BMI Max (24.9) + 20kg Buffer for Muscle
const getSuggestedRange = (heightCm: string) => {
  const h = parseFloat(heightCm);
  if (!h || isNaN(h)) return { min: 0, max: 0 };
  
  const heightM = h / 100; // convert cm to meters
  
  // Lower bound: Strict BMI 18.5 (Health safety floor)
  const minWeight = (18.5 * heightM * heightM).toFixed(1);
  
  // Upper bound: BMI 24.9 + 20KG BUFFER for muscle mass
  const standardMax = 24.9 * heightM * heightM;
  const maxWeight = (standardMax + 20).toFixed(1);
  
  return { min: minWeight, max: maxWeight };
};

// --- COMPONENT: ROW ITEM ---
const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon, label, value, onPress, isSwitch, onSwitch 
}) => (
  <TouchableOpacity 
    style={styles.itemContainer} 
    onPress={onPress}
    disabled={isSwitch}
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
          value={true} 
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

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function SettingsScreen() {
  const router = useRouter();

  // 1. STATE
  const [currentWeight, setCurrentWeight] = useState("75");
  const [goalWeight, setGoalWeight] = useState("70");
  const [height, setHeight] = useState("175"); 
  const [nutrition, setNutrition] = useState("2400");

  // 2. MODAL STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FieldType>(null);
  const [tempValue, setTempValue] = useState("");

  // 3. HANDLERS
  const openEditModal = (field: FieldType, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
    setModalVisible(true);
  };

  const saveEdit = () => {
    const val = parseFloat(tempValue);

    // Basic Validation (Broad limits just to prevent typos)
    if (editingField === 'height') {
      if (isNaN(val) || val < 50 || val > 220) {
        Alert.alert("Invalid Height", "Please enter a valid height in cm.");
        return; 
      }
    }

    if (editingField === 'currentWeight' || editingField === 'goalWeight') {
      if (isNaN(val) || val < 30 || val > 250) {
        Alert.alert("Invalid Weight", "Please enter a valid weight in kg.");
        return; 
      }
    }
    
    // Save logic
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

  // Calculate suggestion based on current height
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
        
        <SectionHeader title="MY GOALS" />
        <View style={styles.section}>
          <SettingsItem 
            icon="resize" 
            label="Height" 
            value={`${height} cm`}
            onPress={() => openEditModal('height', height)} 
          />
          <SettingsItem 
            icon="body" 
            label="Current Weight" 
            value={`${currentWeight} kg`}
            onPress={() => openEditModal('currentWeight', currentWeight)} 
          />
          <SettingsItem 
            icon="flag" 
            label="Goal Weight" 
            value={`${goalWeight} kg`}
            onPress={() => openEditModal('goalWeight', goalWeight)} 
          />
          <SettingsItem 
            icon="restaurant" 
            label="Nutrition Goals" 
            value={`${nutrition} kcal`}
            onPress={() => openEditModal('nutrition', nutrition)} 
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

        <SectionHeader title="SUPPORT" />
        <View style={styles.section}>
          <SettingsItem icon="help-circle" label="Help & FAQs" />
          <SettingsItem icon="shield-checkmark" label="Privacy Policy" />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.7 • Build 2024</Text>
      </ScrollView>

      {/* --- MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding": undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              
              <Text style={styles.modalTitle}>
                {editingField === 'nutrition' ? 'Adjust Calories' : 
                 editingField === 'height' ? 'Update Height' : 
                 editingField === 'goalWeight' ? 'Set Goal Weight' : 'Update Weight'}
              </Text>
              
              {editingField === 'nutrition' ? (
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValueText}>{Math.round(Number(tempValue))} kcal</Text>
                  <Slider
                    style={{width: '100%', height: 40}}
                    minimumValue={1200}
                    maximumValue={6000}
                    step={50}
                    value={Number(tempValue)}
                    onValueChange={(val) => setTempValue(val.toString())}
                    minimumTrackTintColor="#000000"
                    maximumTrackTintColor="#000000"
                    thumbTintColor="#000000"
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLimit}>1200</Text>
                    <Text style={styles.sliderLimit}>6000</Text>
                  </View>
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
                  
                  {/* --- SUGGESTED RANGE HINT (Restored & Adjusted) --- */}
                  {(editingField === 'currentWeight' || editingField === 'goalWeight') && (
                    <View style={styles.infoContainer}>
                      <Ionicons name="information-circle" size={16} color="#666" style={{marginRight: 4}}/>
                      <Text style={styles.helperText}>
                        Broad healthy range for {height}cm:{"\n"}
                        <Text style={{fontWeight:'700', color: '#000'}}>
                           {suggestMin}kg - {suggestMax}kg
                        </Text>
                        {"\n"}(Includes buffer for muscle mass)
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={saveEdit}
                >
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
  sectionHeader: { 
    fontSize: 13, fontWeight: '600', color: '#666', 
    marginTop: 24, marginBottom: 8, marginLeft: 20 
  },
  section: { 
    backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e5e5' 
  },
  itemContainer: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' 
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { 
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#f5f5f5', 
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  itemLabel: { fontSize: 16, fontWeight: '500', color: '#000' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemValue: { fontSize: 15, color: '#8e8e93', marginRight: 8 },
  logoutButton: { 
    marginTop: 30, backgroundColor: '#fff', paddingVertical: 16, 
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e5e5', alignItems: 'center' 
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ff3b30' },
  versionText: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 12 },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    marginTop:100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  // Hint container styles
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  helperText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#000',
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // --- SLIDER STYLES ---
  sliderContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  sliderValueText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    marginBottom: 15,
  },
  sliderLabels: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderLimit: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
});