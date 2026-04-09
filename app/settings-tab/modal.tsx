import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { UserProfile } from '../context/UserInfo';

type FieldType = keyof UserProfile | null;

type SettingsEditModalProps = {
  visible: boolean;
  editingField: FieldType;
  tempValue: string;
  setTempValue: React.Dispatch<React.SetStateAction<string>>;
  suggestMin: string | number;
  suggestMax: string | number;
  onClose: () => void;
  onSave: () => void;
};

export default function SettingsEditModal({
  visible,
  editingField,
  tempValue,
  setTempValue,
  suggestMin,
  suggestMax,
  onClose,
  onSave,
}: SettingsEditModalProps) {
  const inputRef = useRef<TextInput>(null);
  const shouldShowTextInput = editingField !== 'gender' && editingField !== 'nutrition';

  const handleModalShow = useCallback(() => {
    // Android sometimes ignores immediate autofocus inside Modal; defer one frame.
    if (Platform.OS === 'android' && shouldShowTextInput) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [shouldShowTextInput]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      onShow={handleModalShow}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingField === 'gender' ? 'Select Gender' : `Update ${editingField}`}
            </Text>

            {editingField === 'gender' ? (
              <View style={styles.genderOptions}>
                {['Male', 'Female'].map((option) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    key={option}
                    style={[
                      styles.modalInput,
                      styles.genderOption,
                      {
                        backgroundColor: tempValue === option ? '#000' : '#f9f9f9',
                      },
                    ]}
                    onPress={() => setTempValue(option)}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        { color: tempValue === option ? '#fff' : '#000' },
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : editingField === 'nutrition' ? (
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValueText}>{Math.round(Number(tempValue))} kcal</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1200}
                  maximumValue={5000}
                  step={50}
                  value={Number(tempValue) || 0}
                  onValueChange={(val) => setTempValue(val.toString())}
                  minimumTrackTintColor="#000"
                  maximumTrackTintColor="#000"
                  thumbTintColor="#000"
                />
              </View>
            ) : (
              <View>
                <TextInput
                  ref={inputRef}
                  style={styles.modalInput}
                  value={tempValue}
                  onChangeText={(text) => {
                    const digitsOnly = text.replace(/\D/g, '').slice(0, 3);
                    setTempValue(digitsOnly);
                  }}
                  keyboardType="number-pad"
                  autoFocus={Platform.OS === 'ios'}
                  maxLength={3}
                  placeholder="Enter value"
                  placeholderTextColor="#999"
                />
                {(editingField === 'currentWeight' || editingField === 'goalWeight') && (
                  <View style={styles.infoContainer}>
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color="#666"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.helperText}>
                      Broad healthy range: {suggestMin}kg - {suggestMax}kg
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={onSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 150,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    width:'100%',
    
  },
  genderOptions: { gap: 10, marginBottom: 20 },
  genderOption: { justifyContent: 'center', alignItems: 'center' },
  genderOptionText: { fontWeight: '600' },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoIcon: { marginRight: 4 },
  helperText: { fontSize: 13, color: '#444', lineHeight: 18 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalButton: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0' },
  saveButton: { backgroundColor: '#000' },
  cancelButtonText: { color: '#000', fontWeight: '600' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  sliderContainer: { alignItems: 'center', marginBottom: 25 },
  sliderValueText: { fontSize: 32, fontWeight: '800', color: '#000', marginBottom: 15 },
  slider: { width: '100%', height: 40 },
});
