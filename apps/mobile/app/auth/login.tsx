import { Button, Text, Snackbar } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { authClient } from "../../lib/auth-client";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Watch for session changes
  const { data: session } = authClient.useSession();
  
  // Redirect when session becomes available
  useEffect(() => {
    if (session) {
      console.log("Session detected, redirecting to dashboard...");
      router.replace("/(app)/");
    }
  }, [session]);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      console.log("Starting Google OAuth with better-auth client...");

      // The expo client plugin handles the entire OAuth flow automatically
      // including opening the browser and handling the callback
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/(app)/", // Where to redirect after successful sign-in
      });

      // Note: The redirect will happen via the useEffect when session is set
      
    } catch (e: any) {
      console.error("Login error:", e);
      setError(e?.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
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
        duration={3000}
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
    marginBottom: 40,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 6,
  }
});
