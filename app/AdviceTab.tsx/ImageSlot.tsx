import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SlotProps {
  label: string;
  uri: string | null;
  onPress: () => void;
  onRemove: () => void;
  icon: any;
}

export const ImageSlot = ({ label, uri, onPress, onRemove, icon }: SlotProps) => (
  <View style={styles.slot}>
    <Text style={styles.slotLabel}>{label}</Text>
    <TouchableOpacity 
      style={[styles.imageBox, uri && styles.imageBoxActive]} 
      onPress={onPress}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.image} />
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <Ionicons name="close-circle" size={26} color="#000" />
          </TouchableOpacity>
        </>
      ) : <Ionicons name={icon} size={40} color="#555" />}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  slot: { width: '48%' },
  slotLabel: { fontSize: 14, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  imageBox: { height: 240, backgroundColor: '#f9f9f9', borderRadius: 20, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  imageBoxActive: { borderStyle: 'solid', borderColor: '#000', backgroundColor: '#fff' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeButton: { position: 'absolute', top: 10, right: 10, backgroundColor: '#e9e9e946', borderRadius: 15 },
});