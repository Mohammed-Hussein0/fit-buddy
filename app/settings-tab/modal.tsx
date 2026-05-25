import React, { useCallback, useRef } from "react";
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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";
import { UserProfile } from "../context/UserInfo";
import { useMetrics } from "../context/MetricsContext";
import { kgToLbs, lbsToKg } from "../utils/metricsConverter";

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
  const { isMetric } = useMetrics();
  const inputRef = useRef<TextInput>(null);
  const shouldShowTextInput =
    editingField !== "gender" && editingField !== "nutrition";

  const unitLabel =
    editingField === "currentWeight" || editingField === "goalWeight"
      ? isMetric
        ? "kg"
        : "lbs"
      : "cm";

  const handleModalShow = useCallback(() => {
    // Android sometimes ignores immediate autofocus inside Modal; defer one frame.
    if (Platform.OS === "android" && shouldShowTextInput) {
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingField === "gender"
                ? "Select Gender"
                : `Update ${editingField}`}
            </Text>

            {editingField === "gender" ? (
              <View style={styles.genderOptions}>
                {["Male", "Female"].map((option) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    key={option}
                    style={[
                      styles.modalInput,
                      styles.genderOption,
                      {
                        backgroundColor:
                          tempValue === option ? "#000" : "#f9f9f9",
                      },
                    ]}
                    onPress={() => setTempValue(option)}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        { color: tempValue === option ? "#fff" : "#000" },
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : editingField === "nutrition" ? (
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValueText}>
                  {Math.round(Number(tempValue))} kcal
                </Text>
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
                    const digitsOnly = text.replace(/\D/g, "").slice(0, 3);
                    setTempValue(digitsOnly);
                  }}
                  keyboardType="number-pad"
                  autoFocus={Platform.OS === "ios"}
                  maxLength={3}
                  placeholder="Enter value"
                  placeholderTextColor="#999"
                />
                {(editingField === "currentWeight" ||
                  editingField === "goalWeight") && (
                  <View style={styles.infoContainer}>
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color="#666"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.helperText}>
                      Broad healthy range: {suggestMin}
                      {unitLabel} - {suggestMax}
                      {unitLabel}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={onSave}
              >
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 150,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
    color: "#111",
  },
  modalInput: {
    height: 56,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    borderRadius: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 18,
    backgroundColor: "#fff",
    width: "100%",
    paddingHorizontal: 18,
    textAlign: "center",
  },
  genderOptions: { gap: 10, marginBottom: 20 },
  genderOption: { justifyContent: "center", alignItems: "center" },
  genderOptionText: { fontWeight: "600" },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoIcon: { marginRight: 6 },
  helperText: { fontSize: 13, color: "#111", lineHeight: 18 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#f0f0f0" },
  saveButton: { backgroundColor: "#000" },
  cancelButtonText: { color: "#000", fontWeight: "600" },
  saveButtonText: { color: "#fff", fontWeight: "600" },
  sliderContainer: { alignItems: "center", marginBottom: 25 },
  sliderValueText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000",
    marginBottom: 15,
  },
  slider: { width: "100%", height: 40 },
});
