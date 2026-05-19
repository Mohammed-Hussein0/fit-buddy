import { picApi } from "@/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Import our decoupled logic
import { ImageSlot } from "../AdviceTab/ImageSlot";
import { analyzePhysique } from "../AdviceTab/physiqueAI";
import { PhotoGuide } from "../AdviceTab/PhotoGuide";

type PhotoType = "front" | "back";

export default function TabTwoScreen() {
  const [images, setImages] = useState<{
    front: string | null;
    back: string | null;
  }>({
    front: null,
    back: null,
  });
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<PhotoType | null>(null);

  const handlePickImage = async (useCamera: boolean) => {
    if (!activeSlot) return;
    const type = activeSlot;
    setActiveSlot(null);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Enable camera access in settings.");
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6,
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      setImages((prev) => ({ ...prev, [type]: result.assets[0].uri }));
      setAiResponse(null);
    }
  };

  const runAnalysis = async () => {
    if (!images.front || !images.back) return;
    setLoading(true);

    try {
      // Adjusted the parameter layout to match your reverted service signature
      const text = await analyzePhysique(images.front, images.back);

      if (text.startsWith("REJECTED")) {
        setAiResponse(null);
        Alert.alert("Invalid Photos", text.replace("REJECTED", "").trim());
      } else {
        setAiResponse(text);
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
      Alert.alert("Error", "Network request failed.");
    } finally {
      setLoading(false);
    }
  };

  const isReadyForAI = images.front && images.back;

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Physique Advisor</Text>
        <Text style={styles.subtitle}>
          Stateless AI Analysis • Photos are not stored.
        </Text>

        <View style={styles.row}>
          <ImageSlot
            label="Front View"
            uri={images.front}
            icon="person-outline"
            onPress={() => !images.front && setActiveSlot("front")}
            onRemove={() => setImages((p) => ({ ...p, front: null }))}
          />
          <ImageSlot
            label="Back View"
            uri={images.back}
            icon="walk-outline"
            onPress={() => !images.back && setActiveSlot("back")}
            onRemove={() => setImages((p) => ({ ...p, back: null }))}
          />
        </View>

        {aiResponse && (
          <View style={styles.responseCard}>
            <Text style={styles.responseHeader}>AI Feedback:</Text>
            <Text style={styles.responseText}>{aiResponse}</Text>
          </View>
        )}
        <PhotoGuide
          isVisible={showGuide}
          onToggle={() => setShowGuide(!showGuide)}
        />
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (!isReadyForAI || loading) && styles.disabledButton,
          ]}
          disabled={!isReadyForAI || loading}
          onPress={runAnalysis}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>Start AI Analysis</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* SELECTION OVERLAY */}
      {activeSlot && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback onPress={() => setActiveSlot(null)}>
            <View style={styles.overlay}>
              <View style={styles.menuCard}>
                <Text style={styles.menuTitle}>Upload {activeSlot} photo</Text>

                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={() => handlePickImage(true)}
                >
                  <Ionicons name="camera-outline" size={24} color="#fff" />
                  <Text style={styles.menuOptionText}>Take New Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={() => handlePickImage(false)}
                >
                  <Ionicons name="images-outline" size={24} color="#fff" />
                  <Text style={styles.menuOptionText}>Choose from Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveSlot(null)}
                  style={styles.cancelWrap}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: "800", color: "#000", letterSpacing: -1 },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 30,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  responseCard: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  responseHeader: {
    fontWeight: "900",
    marginBottom: 8,
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  responseText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    fontWeight: "500",
  },

  analyzeButton: {
    backgroundColor: "#000",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 100,
  },
  disabledButton: { backgroundColor: "#eee" },
  analyzeButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 45 : 25,
  },
  menuCard: { backgroundColor: "#161616", borderRadius: 28, padding: 20 },
  menuTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    textTransform: "uppercase",
    opacity: 0.6,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#252525",
  },
  menuOptionText: {
    color: "#fff",
    fontSize: 17,
    marginLeft: 15,
    fontWeight: "600",
  },
  cancelWrap: { paddingVertical: 20, marginTop: 5 },
  cancelText: {
    color: "#ff4444",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
});
