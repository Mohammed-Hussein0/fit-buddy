import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SettingsItem, SectionHeader } from '../components/settings-item';

// Define the FieldType here or import it from a shared types file
type FieldType = 'currentWeight' | 'goalWeight' | 'height' | 'nutrition';

interface GoalsSectionProps {
  height: string;
  currentWeight: string;
  goalWeight: string;
  nutrition: string;
  onEdit: (field: FieldType, value: string) => void;
}

export default function GoalsSection({ 
  height, currentWeight, goalWeight, nutrition, onEdit 
}: GoalsSectionProps) {
  return (
    <View>
      <SectionHeader title="MY GOALS" />
      <View style={styles.section}>
        <SettingsItem 
          icon="resize" 
          label="Height" 
          value={`${height} cm`}
          onPress={() => onEdit('height', height)} 
        />
        <SettingsItem 
          icon="body" 
          label="Current Weight" 
          value={`${currentWeight} kg`}
          onPress={() => onEdit('currentWeight', currentWeight)} 
        />
        <SettingsItem 
          icon="flag" 
          label="Goal Weight" 
          value={`${goalWeight} kg`}
          onPress={() => onEdit('goalWeight', goalWeight)} 
        />
        <SettingsItem 
          icon="restaurant" 
          label="Nutrition Goals" 
          value={`${nutrition} kcal`}
          onPress={() => onEdit('nutrition', nutrition)} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { 
    backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e5e5' 
  },
});