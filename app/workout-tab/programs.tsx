import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';



interface Program {
  id: string;
  title: string;
  status: string;
  progress: string;
  image: string;
}
const MY_PROGRAMS: Program[] = [
  { id: 'p1', title: 'Summer Shred 2026', status: 'Active', progress: '45%', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600' },
  { id: 'p2', title: 'Winter Bulk', status: 'Completed', progress: '100%', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
  { id: 'p3', title: 'Home Bodyweight', status: 'Paused', progress: '12%', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600' },
  { id: 'p4', title: 'Yoga Flexibility', status: 'New', progress: '0%', image: 'https://images.unsplash.com/photo-1544367563-12123d8975b9?w=600' },
];

interface programScreenProps {
    handleSelectProgram: (item: Program) => void
}
export default function ProgramScreen({handleSelectProgram}: programScreenProps)
{

const renderProgramItem = ({ item }: { item: Program }) => (
    <TouchableOpacity 
      style={styles.programCard} 
      activeOpacity={0.9}
      onPress={() => handleSelectProgram(item)}
    >
      <Image source={{ uri: item.image }} style={styles.programImage} />
      <View style={styles.programOverlay} />
      
      <View style={styles.programInfo}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.programTitle}>{item.title}</Text>
        <Text style={styles.programProgress}>{item.progress} Complete</Text>
      </View>
      <View style={styles.arrowCircle}>
        <Ionicons name="arrow-forward" size={20} color="#000" />
      </View>
    </TouchableOpacity>
  );

  return(
    <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Programs</Text>
          </View>

          <FlatList 
            data={MY_PROGRAMS}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={renderProgramItem}
            showsVerticalScrollIndicator={false}
            />
            </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  
  // Programs List
  header: { paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -1 },
  
  programCard: { 
    height: 180, 
    marginBottom: 20, 
    borderRadius: 24, 
    overflow: 'hidden', 
    backgroundColor: '#000', 
    justifyContent: 'flex-end',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    // Elevation for Android
    elevation: 5,
  },
  programImage: { ...StyleSheet.absoluteFillObject, opacity: 0.9 },
  programOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)' // Note: React Native doesn't support linear-gradient string natively without expo-linear-gradient, using a solid fallback or library is needed. 
    // For standard RN view without extra libs, we usually just use a transparent black:
  },
  programInfo: { padding: 25, flex: 1, justifyContent: 'flex-end' },
  statusBadge: { 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8, 
    alignSelf: 'flex-start', 
    marginBottom: 10,
    backdropFilter: 'blur(10px)' // Works on some versions, ignored on others
  },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  programTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  programProgress: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  arrowCircle: { 
    position: 'absolute', 
    top: 20, 
    right: 20, 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});