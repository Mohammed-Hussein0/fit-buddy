import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { signInWithGoogle } from "@/supabase";
import { useTheme } from "../context/ThemeContext";

export default function GoogleAuthButton() {
  const { colors } = useTheme();

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      console.error(error);
      alert("Google Sign-In failed");
    }
    // Success is handled automatically by your _layout.tsx listener
  };

  return (
    <TouchableOpacity
      style={[
        styles.googleButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.text,
        },
      ]}
      onPress={handleGoogleLogin}
    >
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png",
        }}
        style={styles.googleIcon}
      />
      <Text style={[styles.googleButtonText, { color: colors.text }]}>
        Continue with Google
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  googleIcon: { width: 24, height: 24, marginRight: 12 },
  googleButtonText: { fontSize: 16, fontWeight: "600", color: "#1f1f1f" },
});
