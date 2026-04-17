import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, 
  Alert, TouchableWithoutFeedback, Platform, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { picApi } from '@/supabase';

// --- CONFIGURATION ---
 // Move to .env later
const genAI = new GoogleGenerativeAI(picApi);

type PhotoType = 'front' | 'back';

export default function TabTwoScreen() {
  const [images, setImages] = useState<{ front: string | null; back: string | null }>({
    front: null,
    back: null,
  });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<PhotoType | null>(null);

  // Helper: Convert URI to Base64 for Gemini
const uriToGenerativePart = async (uri: string) => {
  try {
    // 1. The Resize Step
    // We set the width to 720. The height will automatically scale 
    // to maintain the 3:4 aspect ratio you set in the picker.
    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: 720 } }], 
      { 
        compress: 0.7, // 0.7 is the "sweet spot" for clarity vs size
        format: SaveFormat.JPEG 
      }
    );

    // 2. The Conversion Step
    // Now we use the resized, smaller image for the AI
    const file = new File(manipulatedImage.uri);
    const base64Data = await file.base64();
    
    return {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
    };
  } catch (err) {
    console.error("Resizing failed:", err);
    // Fallback: If resizing fails, try to send the original (better than crashing)
    const file = new File(uri);
    const base64Data = await file.base64();
    return { inlineData: { data: base64Data, mimeType: "image/jpeg" } };
  }
};
 const runAnalysis = async () => {
  if (!images.front || !images.back) return;

  setLoading(true);
  try {
    // 1. Prepare your data
    const frontPart = await uriToGenerativePart(images.front);
    const backPart = await uriToGenerativePart(images.back);

    const promptText =`
    You are a professional physique competition judge and coach. 
    Analyze the provided front and back photos, legs do not matter now.

    CRITICAL RULE: If the photos are blurry, too dark, do not show a human upper body, 
    or are otherwise unusable for a physique review, start your response ONLY with 
    the word "REJECTED" followed by the reason why, but if the subject is wearing tight clothes start with a warning about how it is hard to judge with clothes but try and give an assessment 
    if the clothes are to baggy then reject.

    also take note that a lot of photos will be of people posing so make sure you do not get tricked by it
    If valid, provide the review in this format:
    
    OVERALL REVIEW:
    [2-3 sentences summarizing the user's current physique, try mentioning 1-2 strong points like "broad clavicles" or "good lat width" only if they actually exist do not lie.]

    LAGGING GROUPS:
    - [Muscle Group]: [Blunt reason why it's lagging].
    
    ACTION PLAN:
    - [Exercise 1]: [Specific cue for improvement].
    - [Exercise 2]: [Specific cue for improvement].

    Tone: Professional, blunt, and encouraging. No fluff.
  `;

    // 2. Use manual fetch (Bypasses the library's AIza check)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${picApi}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptText },
              frontPart, // This is the {inlineData: {...}} from your helper
              backPart
            ]
          }]
        })
      }
    );

  const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    if (text.startsWith("REJECTED")) {
      setAiResponse(null);
      Alert.alert("Invalid Photos", text.replace("REJECTED", "").trim());
    } else {
      setAiResponse(text);
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    Alert.alert("Error", "Network request failed.");
  } finally {
    setLoading(false);
  }
};

  // ... (Your handlePickImage and handleRemoveImage functions remain the same)
  const handlePickImage = async (useCamera: boolean) => {
    if (!activeSlot) return;
    const type = activeSlot; 
    setActiveSlot(null);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission required", "Enable camera access in settings.");
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6, // Reduced quality slightly for faster upload/processing
    };

    const result = useCamera 
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      setImages(prev => ({ ...prev, [type]: result.assets[0].uri }));
      setAiResponse(null); // Reset response if new photo added
    }
  };

  const handleRemoveImage = (type: PhotoType) => {
    setImages(prev => ({ ...prev, [type]: null }));
    setAiResponse(null);
  };

  const isReadyForAI = images.front && images.back;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Physique Advisor</Text>
        <Text style={styles.subtitle}>Stateless AI Analysis • Photos are not stored.</Text>

        <View style={styles.row}>
          {/* Front View Slot */}
          <View style={styles.slot}>
            <Text style={styles.slotLabel}>Front View</Text>
            <TouchableOpacity 
              style={[styles.imageBox, images.front && styles.imageBoxActive]} 
              onPress={() => !images.front && setActiveSlot('front')}
            >
              {images.front ? (
                <>
                  <Image source={{ uri: images.front }} style={styles.image} />
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage('front')}>
                    <Ionicons name="close-circle" size={26} color="#000" />
                  </TouchableOpacity>
                </>
              ) : <Ionicons name="person-outline" size={40} color="#555" />}
            </TouchableOpacity>
          </View>

          {/* Back View Slot */}
          <View style={styles.slot}>
            <Text style={styles.slotLabel}>Back View</Text>
            <TouchableOpacity 
              style={[styles.imageBox, images.back && styles.imageBoxActive]} 
              onPress={() => !images.back && setActiveSlot('back')}
            >
              {images.back ? (
                <>
                  <Image source={{ uri: images.back }} style={styles.image} />
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage('back')}>
                    <Ionicons name="close-circle" size={26} color="#000" />
                  </TouchableOpacity>
                </>
              ) : <Ionicons name="walk-outline" size={40} color="#555" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Results Section */}
        {aiResponse && (
          <View style={styles.responseCard}>
            <Text style={styles.responseHeader}>Feedback:</Text>
            <Text style={styles.responseText}>{aiResponse}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.analyzeButton, (!isReadyForAI || loading) && styles.disabledButton]} 
          disabled={!isReadyForAI || loading}
          onPress={runAnalysis}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.analyzeButtonText}>Start AI Analysis</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* --- SELECTION MENU REMAINS SAME AS YOURS --- */}
      {activeSlot && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback onPress={() => setActiveSlot(null)}>
            <View style={styles.overlay}>
              <View style={styles.menuCard}>
                <Text style={styles.menuTitle}>Upload {activeSlot} photo</Text>
                <TouchableOpacity style={styles.menuOption} onPress={() => handlePickImage(true)}>
                  <Ionicons name="camera-outline" size={24} color="#fff" /><Text style={styles.menuOptionText}>Take New Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuOption} onPress={() => handlePickImage(false)}>
                  <Ionicons name="images-outline" size={24} color="#fff" /><Text style={styles.menuOptionText}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveSlot(null)} style={{paddingVertical: 15}}>
                  <Text style={{color: '#ff4444', textAlign: 'center'}}>Cancel</Text>
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
  // ... Keep your existing styles, but add these:
  responseCard: {
    backgroundColor: '#f4f4f4',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#000'
  },
  responseHeader: { fontWeight: '800', marginBottom: 5, fontSize: 16 },
  responseText: { fontSize: 15, lineHeight: 22, color: '#333' },
  // ... (Paste the rest of your original styles here)
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
  
  // Slot Layout
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  slot: { width: '48%' },
  slotLabel: { fontSize: 14, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  
  imageWrapper: { position: 'relative' },
  imageBox: {
    height: 240,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  imageBoxActive: { borderStyle: 'solid', borderColor: '#000', backgroundColor: '#fff' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  // Delete Button Overlay
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e9e9e946',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#575050',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  // Action Button
  analyzeButton: {
    backgroundColor: '#000',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 80
  },
  disabledButton: { backgroundColor: '#ccc' },
  analyzeButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Overlay / Custom Menu
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  menuCard: {
    backgroundColor: '#1c1c1c',
    borderRadius: 24,
    padding: 20,
  },
  menuTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 15, textAlign: 'center', textTransform: 'capitalize' },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  menuOptionText: { color: '#fff', fontSize: 16, marginLeft: 15, fontWeight: '500' }
});