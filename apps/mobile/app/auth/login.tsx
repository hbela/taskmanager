import { Button, Text, Snackbar } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { authClient } from "../../lib/auth-client";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Watch for session changes - this is key for the expo plugin flow
  const { data: session, isPending } = authClient.useSession();
  
  // Redirect when session becomes available
  useEffect(() => {
    if (session && !isPending) {
      console.log("Session detected, redirecting to dashboard...");
      router.replace("/(app)");
    }
  }, [session, isPending]);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      console.log("=== Starting Google OAuth with expo client plugin ===");

      // The expo client plugin handles the entire OAuth flow automatically:
      // 1. It generates and stores the state parameter
      // 2. It opens the browser with the correct authorization URL
      // 3. It handles the callback and extracts the session
      // 4. It stores the session in SecureStore
      
      // DO NOT manually fetch or use WebBrowser - let the plugin handle it
      await authClient.signIn.social({
        provider: "google",
      });

      // The useSession hook above will detect the session and redirect
      // If we reach here without redirect, the flow might still be completing
      console.log("Sign-in initiated, waiting for session...");
      
    } catch (e: any) {
      console.error("=== Login Error ===");
      console.error("Error:", e);
      console.error("Error message:", e?.message);
      
      // Don't show error for user cancellation
      if (e?.message?.includes("cancel") || e?.message?.includes("dismiss")) {
        console.log("User cancelled sign-in");
      } else {
        setError(e?.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking initial session
  if (isPending) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Sign in to manage your tasks
      </Text>
      <Button
        mode="contained"
        onPress={handleLogin}
        icon="google"
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in with Google"}
      </Button>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={5000}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  button: {
    paddingVertical: 6,
  }
});
