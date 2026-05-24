import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

interface profileInfoProps {
  username: string;
  email: string;
  joinDate: string;
}

export default function ProfileInfo({
  username,
  email,
  joinDate,
}: profileInfoProps) {
  // 1. Existing State for Text Animation
  const [showEmail, setShowEmail] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  // 2. New State for Image Modal
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();
  const { colors } = useTheme();

  // Hardcoded image source (so we can reuse it easily in both spots)
  const profileImage = require("../../assets/images/Peak2.jpeg");

  useEffect(() => {
    const loop = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(300),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => setShowEmail((prev) => !prev), 800);
    }, 6000);
    return () => clearInterval(loop);
  }, []);

  return (
    <View style={styles.profileRow}>
      {/* 3. Wrap Avatar in TouchableOpacity to trigger Modal */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Image
          source={profileImage}
          style={[styles.avatar, { borderColor: colors.border }]}
        />
      </TouchableOpacity>

      <View style={styles.profileInfo}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>PRO MEMBER</Text>
        </View>

        <Animated.Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.4}
          style={[
            styles.dynamicText,
            { opacity: fadeAnim, color: colors.text },
          ]}
        >
          {showEmail ? email : `${username}`}
        </Animated.Text>

        <Text style={[styles.joinDate, { color: colors.secondaryText }]}>
          {joinDate}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.settingsBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => router.push("/settings")}
      >
        <Ionicons name="settings-sharp" size={24} color={colors.icon} />
      </TouchableOpacity>

      {/* 4. The Full Screen Image Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)} // Close on background tap
        >
          <StatusBar
            backgroundColor="rgba(0,0,0,0.9)"
            barStyle="light-content"
          />

          <Image
            source={profileImage}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Your existing styles...
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  profileInfo: {
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  dynamicText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    height: 28,
    lineHeight: 28,
    marginBottom: 0,
    marginRight: 2,
  },
  joinDate: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
  },

  // ...New Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: 400,
    borderRadius: 12,
  },
});
