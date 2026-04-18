import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PhotoGuideProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const PhotoGuide = ({ isVisible, onToggle }: PhotoGuideProps) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        style={styles.toggleBtn} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Ionicons name="information-circle-outline" size={20} color="#000" />
        <Text style={styles.toggleText}>
          {isVisible ? "Hide Photo Requirements" : "See Photo Requirements"}
        </Text>
        <Ionicons name={isVisible ? "chevron-up" : "chevron-down"} size={18} color="#000" />
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.content}>
          <View style={styles.step}>
            <View style={styles.iconCircle}>
              <Ionicons name="phone-portrait" size={18} color="#000" />
            </View>
            <View style={styles.textStack}>
              <Text style={styles.stepTitle}>Portrait Only</Text>
              <Text style={styles.stepSub}>Landscape shots distort body proportions.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.iconCircle}>
              <Ionicons name="sunny" size={18} color="#000" />
            </View>
            <View style={styles.textStack}>
              <Text style={styles.stepTitle}>Direct Lighting</Text>
              <Text style={styles.stepSub}>Overhead light creates shadows needed for definition.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.iconCircle}>
              <Ionicons name="shirt" size={18} color="#000" />
            </View>
            <View style={styles.textStack}>
              <Text style={styles.stepTitle}>Maximum Visibility</Text>
              <Text style={styles.stepSub}>Shirtless or tight gear. Baggy clothes will be rejected.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.iconCircle}>
              <Ionicons name="resize" size={18} color="#000" />
            </View>
            <View style={styles.textStack}>
              <Text style={styles.stepTitle}>Chest Height</Text>
              <Text style={styles.stepSub}>Keep camera 2m away at mid-torso level.</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  toggleText: { flex: 1, fontSize: 13, fontWeight: '800', marginLeft: 10, color: '#000' },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textStack: { marginLeft: 15, flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '900', color: '#000', marginBottom: 2 },
  stepSub: { fontSize: 12, color: '#666', lineHeight: 18, fontWeight: '500' },
});