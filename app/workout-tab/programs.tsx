import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// --- Types ---
interface Program {
  id: string;
  title: string;
  image: string;
}

interface programScreenProps {
    handleSelectProgram: (item: Program) => void;
    currentProgramId?: string; // Allow parent to tell us which is active
}

const MY_PROGRAMS: Program[] = [
  { id: 'p1', title: 'Summer Shred 2026', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600' },
  { id: 'p2', title: 'Winter Bulk',  image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
  { id: 'p3', title: 'Home Bodyweight',  image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600' },
];

export default function ProgramScreen({ handleSelectProgram, currentProgramId: initialId }: programScreenProps) {
  const [programs, setPrograms] = useState<Program[]>(MY_PROGRAMS);
  const [currentProgramId, setCurrentProgramId] = useState<string>(initialId || 'p1');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newProgramTitle, setNewProgramTitle] = useState('');

  const addCardItem: Program = { id: 'add-program-card', title: 'Add', image: '' };

  const handleCreateProgram = () => {
    const trimmedTitle = newProgramTitle.trim();
    if (!trimmedTitle) return;

    const newProgram: Program = {
      id: `custom-${Date.now()}`,
      title: trimmedTitle,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    };

    setPrograms((prev) => [...prev, newProgram]);
    setIsCreateModalVisible(false);
    setNewProgramTitle('');
    Keyboard.dismiss();
  };

  const renderProgramItem = ({ item }: { item: Program }) => {
    const isAddCard = item.id === addCardItem.id;
    
    if(isAddCard) return (
      <TouchableOpacity 
        style={styles.optionToAdd} 
        activeOpacity={0.8}
        onPress={() => setIsCreateModalVisible(true)}
      >
        <View style={styles.optionToAddInner}>
          <View style={styles.optionAddIconWrap}>
            <Ionicons name="add" size={26} color="#fff" />
          </View>
          <Text style={styles.optionAddTitle}>Create Program</Text>
          <Text style={styles.optionAddSubtitle}>Custom training plan</Text>
        </View>
      </TouchableOpacity>
    );
      
    const isCurrentProgram = item.id === currentProgramId;

    return (
      <TouchableOpacity 
        style={[styles.programCard, isCurrentProgram && styles.activeCardBorder]} 
        activeOpacity={0.9}
        onPress={() => {
          setCurrentProgramId(item.id);
          handleSelectProgram(item); // Navigates to WeeklySchedule
        }}
      >
        <Image source={{ uri: item.image }} style={styles.programImage} />
        <View style={styles.programOverlay} />
        <View style={styles.programInfo}>
          <View style={[styles.statusBadge, isCurrentProgram && styles.activeBadge]}>
            <Text style={styles.statusText}>{isCurrentProgram ? 'Active Now' : 'Tap to Switch'}</Text>
          </View>
          <Text style={styles.programTitle}>{item.title}</Text>
        </View>
        <View style={styles.arrowCircle}>
          <Ionicons name={isCurrentProgram ? "checkmark" : "arrow-forward"} size={20} color="#000" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Programs</Text>
        <Text style={styles.headerSubtitle}>Select your current training goal</Text>
      </View>

      <FlatList 
        data={[...programs, addCardItem]}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderProgramItem}
        showsVerticalScrollIndicator={false}
      />

      {/* CREATE NEW PROGRAM "MODAL" */}
      {isCreateModalVisible && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsCreateModalVisible(false)}>
            <View style={styles.backdropBlur} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Program</Text>
            <TextInput
              autoFocus
              value={newProgramTitle}
              onChangeText={setNewProgramTitle}
              placeholder="e.g. 5x5 Powerlifting"
              placeholderTextColor="#555"
              style={styles.input}
              maxLength={25}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCreateModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateProgram}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 25 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#000', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#888', fontWeight: '500' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  programCard: { 
    height: 180, 
    marginBottom: 20, 
    borderRadius: 28, 
    overflow: 'hidden', 
    backgroundColor: '#000', 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  activeCardBorder: { borderWidth: 2, borderColor: '#000' },
  programImage: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
  programOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  programInfo: { padding: 25, flex: 1, justifyContent: 'flex-end' },
  statusBadge: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  activeBadge: { backgroundColor: '#00000085' },
  statusText: { color: '#fff', fontSize: 11, textTransform: 'uppercase' },
  programTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  arrowCircle: { position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },

  optionToAdd:{ height: 120, marginBottom: 20, borderRadius: 28, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  optionToAddInner: { alignItems: 'center' },
  optionAddIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  optionAddTitle: { color: '#000', fontSize: 16, fontWeight: '700' },
  optionAddSubtitle: { color: '#888', fontSize: 12 },

  // Modal (Absolute View)
  modalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', padding: 25, zIndex: 1000 },
  backdropBlur: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
  input: { backgroundColor: '#f4f4f4', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 20, color: '#000' },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, padding: 15, alignItems: 'center' },
  createButton: { flex: 2, backgroundColor: '#000', padding: 15, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#888' },
  createText: { fontWeight: '800', color: '#fff' },
});