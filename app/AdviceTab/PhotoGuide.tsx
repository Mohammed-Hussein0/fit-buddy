import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface PhotoGuideProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const PhotoGuide = ({ isVisible, onToggle }: PhotoGuideProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.toggleBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.icon}
        />
        <Text style={[styles.toggleText, { color: colors.text }]}>
          {isVisible ? "Hide Photo Requirements" : "See Photo Requirements"}
        </Text>
        <Ionicons
          name={isVisible ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.icon}
        />
      </TouchableOpacity>

      {isVisible && (
        <View
          style={[
            styles.content,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.step}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons name="phone-portrait" size={18} color={colors.icon} />
            </View>
            <View style={styles.textStack}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Portrait Only
              </Text>
              <Text style={[styles.stepSub, { color: colors.secondaryText }]}>
                Landscape shots distort body proportions.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons name="sunny" size={18} color={colors.icon} />
            </View>
            <View style={styles.textStack}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Direct Lighting
              </Text>
              <Text style={[styles.stepSub, { color: colors.secondaryText }]}>
                Overhead light creates shadows needed for definition.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons name="shirt" size={18} color={colors.icon} />
            </View>
            <View style={styles.textStack}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Maximum Visibility
              </Text>
              <Text style={[styles.stepSub, { color: colors.secondaryText }]}>
                Shirtless or tight gear. Baggy clothes will be rejected.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons name="resize" size={18} color={colors.icon} />
            </View>
            <View style={styles.textStack}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Chest Height
              </Text>
              <Text style={[styles.stepSub, { color: colors.secondaryText }]}>
                Keep camera 2m away at mid-torso level.
              </Text>
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
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleText: { flex: 1, fontSize: 13, fontWeight: "800", marginLeft: 10 },
  content: {
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
  },
  step: { flexDirection: "row", alignItems: "flex-start", marginBottom: 18 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  textStack: { marginLeft: 15, flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: "900", marginBottom: 2 },
  stepSub: { fontSize: 12, lineHeight: 18, fontWeight: "500" },
});
