The authentication is working correctly, but after the OAuth callback, the server is redirecting to / on the API server (ngrok URL), not to your mobile app's deep link.

The problem is that after successful OAuth, Better-Auth is redirecting to the API server's root / instead of back to your mobile app via the taskmanager:// deep link.

The Fix
The expo plugin needs to know where to redirect after authentication. You need to pass a callbackURL that uses your app's deep link scheme. Update your login.tsx:

await authClient.signIn.social({
  provider: "google",
  callbackURL: "taskmanager://",  // Add this - redirect back to mobile app
});

Here's the complete updated login.tsx:

import { Button, Text, Snackbar } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { authClient } from "../../lib/auth-client";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Watch for session changes
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

      await authClient.signIn.social({
        provider: "google",
        callbackURL: "taskmanager://",  // ← KEY: Redirect back to mobile app
      });

      console.log("Sign-in initiated, waiting for session...");
      
    } catch (e: any) {
      console.error("Login Error:", e?.message);
      
      if (e?.message?.includes("cancel") || e?.message?.includes("dismiss")) {
        console.log("User cancelled sign-in");
      } else {
        setError(e?.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
