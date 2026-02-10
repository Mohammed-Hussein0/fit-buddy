import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  onSwitch?: (value: boolean) => void;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ 
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

export const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const styles = StyleSheet.create({
  sectionHeader: { 
    fontSize: 13, fontWeight: '600', color: '#666', 
    marginTop: 24, marginBottom: 8, marginLeft: 20 
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
});