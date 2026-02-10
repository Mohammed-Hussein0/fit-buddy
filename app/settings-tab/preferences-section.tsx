import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SettingsItem, SectionHeader } from '../components/settings-item';

export default function AppPreferences() {
  return (
    <View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  section: { 
    backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e5e5' 
  },
});