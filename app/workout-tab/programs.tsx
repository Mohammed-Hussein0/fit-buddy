import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Program {
  id: string;
  title: string;
  image: string;
}

const MY_PROGRAMS: Program[] = [
  { id: 'p1', title: 'Summer Shred 2026', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600' },
  { id: 'p2', title: 'Winter Bulk',  image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
  { id: 'p3', title: 'Home Bodyweight',  image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600' },
];

interface programScreenProps {
    handleSelectProgram: (item: Program) => void
}

export default function ProgramScreen({handleSelectProgram}: programScreenProps) {
  const [programs, setPrograms] = useState<Program[]>(MY_PROGRAMS);
  const [currentProgramId, setCurrentProgramId] = useState<string>('p1');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newProgramTitle, setNewProgramTitle] = useState('');

  const addCardItem: Program = {
    id: 'add-program-card',
    title: 'Add',
    image: '',
  };

  const resetCreateForm = () => {
    setNewProgramTitle('');
    Keyboard.dismiss();
  };

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
    resetCreateForm();
  };

  const renderProgramItem = ({ item }: { item: Program, index:number }) => {
    const isAddCard = item.id === addCardItem.id;
    
    if(isAddCard) return (
      <TouchableOpacity 
        style={styles.optionToAdd} 
        activeOpacity={0.9}
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
        style={styles.programCard} 
        activeOpacity={0.9}
        onPress={() => {
          setCurrentProgramId(item.id);
          handleSelectProgram(item);
        }}
      >
        <Image source={{ uri: item.image }} style={styles.programImage} />
        <View style={styles.programOverlay} />
        <View style={styles.programInfo}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{isCurrentProgram ? 'In Use' : 'Not Active'}</Text>
          </View>
          <Text style={styles.programTitle}>{item.title}</Text>
        </View>
        <View style={styles.arrowCircle}>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Programs</Text>
      </View>

      <FlatList 
        data={[...programs, addCardItem]}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderProgramItem}
        showsVerticalScrollIndicator={false}
      />

      {/* REPLACED MODAL WITH ABSOLUTE VIEW */}
      {isCreateModalVisible && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback onPress={() => {
            setIsCreateModalVisible(false);
            resetCreateForm();
          }}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>New Program</Text>
                  <Text style={styles.modalSubtitle}>Add your own training program</Text>

                  <TextInput
                    autoFocus={true}
                    value={newProgramTitle}
                    onChangeText={setNewProgramTitle}
                    placeholder="Program name"
                    placeholderTextColor="#8b8b8b"
                    style={styles.input}
                    // On Android, autoFocus in a regular View is much more reliable
                  />

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => {
                        setIsCreateModalVisible(false);
                        resetCreateForm();
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.createButton]}
                      onPress={handleCreateProgram}
                    >
                      <Text style={styles.createButtonText}>Add Program</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  header: { paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -1 },

  // Program Card Styles
  programCard: { 
    height: 180, 
    marginBottom: 20, 
    borderRadius: 24, 
    overflow: 'hidden', 
    backgroundColor: '#000', 
    justifyContent: 'flex-end',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  programImage: { ...StyleSheet.absoluteFillObject, opacity: 0.9 },
  programOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.3)' 
  },
  programInfo: { padding: 25, flex: 1, justifyContent: 'flex-end' },
  statusBadge: { 
    backgroundColor: 'rgba(0, 0, 0, 0.34)', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8, 
    alignSelf: 'flex-start', 
    marginBottom: 10 
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  programTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
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

  // Add Card Styles
  optionToAdd:{
    height: 130,
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(16,16,16,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
  },
  optionToAddInner: {justifyContent:'center', alignItems:'center'},
  optionAddIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionAddTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  optionAddSubtitle: { color: 'rgba(255,255,255,0.72)', fontSize: 13 },

  // Fake Modal (Absolute View) Styles
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-start',
    paddingTop: 140, // Adjust based on where you want the card to appear
    paddingHorizontal: 20,
    zIndex: 999, // Ensure it sits on top of the list
  },
  modalCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 14 },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 10,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionButton: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: 'rgba(255,255,255,0.08)' },
  createButton: { backgroundColor: '#fff' },
  cancelButtonText: { color: '#fff', fontWeight: '700' },
  createButtonText: { color: '#111', fontWeight: '800' },
});