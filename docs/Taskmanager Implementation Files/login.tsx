import { Button, Text, Snackbar } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { authClient } from "../../lib/auth-client"; // Import the configured auth client
import * as WebBrowser from "expo-web-browser";

// This is required for the browser to close properly after OAuth
WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      console.log("Starting Google OAuth with better-auth client...");

      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "taskmanager://", // Explicitly set the callback URL
      });

      console.log("Sign-in result:", JSON.stringify(result, null, 2));

      // The result contains the OAuth URL, we need to open it
      if (result?.data?.url && result?.data?.redirect) {
        console.log("Opening OAuth URL in browser...");
        
        // Open the OAuth URL - the Expo plugin will handle the callback
        const authResult = await WebBrowser.openAuthSessionAsync(
          result.data.url,
          "taskmanager://"
        );
        
        console.log("Browser result:", authResult);
        
        if (authResult.type === "success") {
          console.log("OAuth completed, checking session...");
          
          // Wait a moment for the session to be saved
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if we now have a session
          const session = await authClient.getSession();
          console.log("Session after OAuth:", session);
          
          if (session?.data) {
            console.log("Sign-in successful, redirecting to app...");
            router.replace("/(app)");
          } else {
            throw new Error("No session found after OAuth");
          }
        } else if (authResult.type === "cancel") {
          throw new Error("Sign-in cancelled");
        } else {
          throw new Error("OAuth failed");
        }
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (e: any) {
      console.error("Login error:", e);
      console.error("Error message:", e?.message);
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
