import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

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
  const [showEmail, setShowEmail] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

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
    }, 6000); // Slower, less distracting interval
    return () => clearInterval(loop);
  }, []);
  const router = useRouter();

  return (
    <View style={styles.profileRow}>
      <Image source={require("../../assets/images/Peak2.jpeg")}
        style={styles.avatar}
      />
      <View style={styles.profileInfo}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>PRO MEMBER</Text>
        </View>

        {/* MODIFIED: Added automatic resizing props */}
       <Animated.Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.4} // Allow it to shrink more if needed
          style={[
            // 1. Combine the base style here
            styles.dynamicText, 
            // 2. Add the opacity animation
            { opacity: fadeAnim },
          ]}
        >
          {showEmail ? email : `${username}`}
        </Animated.Text>

        <Text style={styles.joinDate}>{joinDate}</Text>
      </View>
      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={() => router.push("/settings")}
      >
        <Ionicons name="settings-sharp" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
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
    // THE FIX: Reserve exact vertical space
    height: 28,      // Fixed height prevents the container from shrinking/growing
    lineHeight: 28,  // Ensures text sits in the middle of that height
    marginBottom: 0,
    marginRight:2 // consistent spacing below the text
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
});
