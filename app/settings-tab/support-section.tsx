import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SettingsItem, SectionHeader } from '../components/settings-item';

export default function SupportSection() {
  return (
    <View>
      <SectionHeader title="SUPPORT" />
      <View style={styles.section}>
        <SettingsItem icon="help-circle" label="Help & FAQs" />
        <SettingsItem icon="shield-checkmark" label="Privacy Policy" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { 
    backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e5e5' 
  },
});