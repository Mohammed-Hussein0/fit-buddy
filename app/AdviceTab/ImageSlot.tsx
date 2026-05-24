import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface SlotProps {
  label: string;
  uri: string | null;
  onPress: () => void;
  onRemove: () => void;
  icon: any;
}

export const ImageSlot = ({
  label,
  uri,
  onPress,
  onRemove,
  icon,
}: SlotProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.slot}>
      <Text style={[styles.slotLabel, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.imageBox,
          uri && [styles.imageBoxActive, { borderColor: colors.icon }],
          { backgroundColor: colors.surface },
        ]}
        onPress={onPress}
      >
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
              <Ionicons name="close-circle" size={26} color={colors.text} />
            </TouchableOpacity>
          </>
        ) : (
          <Ionicons name={icon} size={40} color={colors.secondaryText} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: { width: "48%" },
  slotLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  imageBox: {
    height: 240,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imageBoxActive: { borderStyle: "solid" },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 15,
    padding: 4,
  },
});
