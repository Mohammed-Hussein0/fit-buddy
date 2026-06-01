import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../supabase";
import { useTheme } from "./context/ThemeContext";
function checkPasswordStrength(password: string): { label: string; color: string; width: string } {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 1) return { label: "😢 Weak", color: "#e74c3c", width: "25%" };
  if (strength === 2) return { label: "😐 Fair", color: "#e67e22", width: "50%" };
  if (strength === 3) return { label: "😊 Good", color: "#f1c40f", width: "75%" };
  return { label: "💪 Strong", color: "#2ecc71", width: "100%" };
}
export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState<{ label: string; color: string; width: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function signUpWithEmail() {
    if (!email || !password || !username) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    // 1. Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // 2. Store the username in the user's metadata immediately
        data: {
          username: username,
        },
      },
    });

    if (error) {
      Alert.alert("Sign Up Failed", error.message);
    } else {
      // 3. Success!
      if (!data.session) {
        Alert.alert(
          "Success",
          "Please check your inbox for email verification!",
        );
      }
      // If auto-confirm is on, the _layout.tsx listener handles the redirect.
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.headerContainer, { alignItems: "center" }]}>
          <View style={{ width: 170, height: 170, borderRadius: 85, backgroundColor: "#ffffff", alignSelf: "center", justifyContent: "center", alignItems: "center", marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <Image source={require("../assets/images/LogoNameNoBack.png")} style={{ width: 250, height: 250, resizeMode: "contain" }} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Create Account
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.secondaryText }]}
          >
            Join us and start your journey
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>USERNAME</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            onChangeText={setUsername}
            value={username}
            placeholder="johndoe"
            placeholderTextColor={colors.secondaryText}
            
            autoCapitalize="none"
          />

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

          <Text style={[styles.label, { color: colors.text }]}>PASSWORD</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            onChangeText={(text) => {
  setPassword(text);
  setStrength(text.length > 0 ? checkPasswordStrength(text) : null);
}}
         value={password}
            secureTextEntry={!showPassword}
            maxLength={16}
            placeholder="Create a password"
            placeholderTextColor={colors.secondaryText}
          />
<TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginTop: 8, alignItems: "flex-end" }}>
  <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
    {showPassword ? "🙈 Hide Password" : "👁 Show Password"}
  </Text>
</TouchableOpacity>
          {strength && (
            <View style={{ marginTop: 8 }}>
              <View style={{ height: 6, backgroundColor: "#e0e0e0", borderRadius: 3 }}>
                <View style={{ width: strength.width as any, height: 6, backgroundColor: strength.color, borderRadius: 3 }} />
              </View>
<Text style={{ color: strength.color, marginTop: 4, fontSize: 12 }}>{strength.label}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={signUpWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/login")}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              { color: colors.secondaryText },
            ]}
          >
            Already have an account? Log In
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
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
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
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
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
});
