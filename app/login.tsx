import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../supabase";
import GoogleAuthButton from "./components/GoogleAuthButton";
import { useTheme } from "./context/ThemeContext";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Login Failed", error.message);
      setLoading(false);
    } else {
      router.replace("/(tabs)/profile");
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* 2. KeyboardAvoidingView sits inside. 
           CRITICAL FIX: behavior is undefined for Android to prevent double-padding. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {/* 3. ScrollView handles the actual content movement */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContent}>
            <View style={[styles.headerContainer, { alignItems: "center" }]}>
              <View style={{ width: 170, height: 170, borderRadius: 85, backgroundColor: "#ffffff", alignSelf: "center", justifyContent: "center", alignItems: "center", marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                 <Image source={require("../assets/images/LogoNameNoBack.png")} style={{ width: 250, height: 250, resizeMode: "contain" }} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Welcome Back
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: colors.secondaryText }]}
              >
                Sign in to continue your progress
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>EMAIL</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                onChangeText={setEmail}
                value={email}
                placeholder="name@example.com"
                placeholderTextColor={colors.secondaryText}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={[styles.label, { color: colors.text }]}>
                PASSWORD
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                onChangeText={setPassword}
                value={password}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.secondaryText}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginTop: 8, alignItems: "flex-end" }}>
                <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
                  {showPassword ? "🙈 Hide Password" : "👁 Show Password"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={signInWithEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={{ alignItems: "center", marginVertical: 20 }}>
              <Text style={{ color: colors.secondaryText, fontWeight: "600" }}>
                OR
              </Text>
            </View>

            <GoogleAuthButton />

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.secondaryButtonText}>
                Don&apos;t have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center", // Keeps content centered when keyboard is CLOSED
    paddingBottom: 30, // Small padding for bottom aesthetics
  },
  headerContainer: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    marginTop: 20,
    letterSpacing: 1,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#000",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    padding: 10,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
});
