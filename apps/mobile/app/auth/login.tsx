import { Button, Text, Snackbar } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

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
      console.log("=== Starting Google OAuth (Simple Direct Approach) ===");
      
      const baseURL = "https://f2c05ede579e.ngrok-free.app";
      
      // Get the OAuth URL from Better-Auth
      const signInURL = `${baseURL}/api/auth/sign-in/social`;
      
      console.log("Fetching OAuth URL from:", signInURL);
      
      const signInResponse = await fetch(signInURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "taskmanager://",
        },
        body: JSON.stringify({
          provider: "google",
          callbackURL: `${baseURL}/api/auth/callback/google`, // Use the actual callback URL
        }),
      });

      console.log("Response status:", signInResponse.status);
      const signInData = await signInResponse.json();
      console.log("Response data:", JSON.stringify(signInData, null, 2));

      if (!signInData.url) {
        throw new Error("No authorization URL received from server");
      }

      console.log("Opening Google OAuth URL...");
      console.log("URL:", signInData.url);
      
      // Open the OAuth URL directly
      const authResult = await WebBrowser.openAuthSessionAsync(
        signInData.url,
        `${baseURL}/api/auth/callback/google`
      );
      
      console.log("Browser result type:", authResult.type);
      console.log("Browser result:", JSON.stringify(authResult, null, 2));
      
      if (authResult.type === "success") {
        console.log("OAuth completed successfully!");
        console.log("Callback URL:", authResult.url);
        
        // The callback has happened on the server, now check for session
        console.log("Waiting for session to be created...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if we now have a session
        console.log("Checking for session...");
        const session = await authClient.getSession();
        console.log("Session check result:", JSON.stringify(session, null, 2));
        
        if (session?.data) {
          console.log("✅ Session found! User:", session.data.user?.email);
          console.log("Redirecting to app...");
          router.replace("/(app)");
        } else {
          console.error("❌ No session found after OAuth");
          console.log("Trying to fetch session one more time...");
          
          // Try one more time after a longer wait
          await new Promise(resolve => setTimeout(resolve, 2000));
          const retrySession = await authClient.getSession();
          console.log("Retry session check:", JSON.stringify(retrySession, null, 2));
          
          if (retrySession?.data) {
            console.log("✅ Session found on retry!");
            router.replace("/(app)");
          } else {
            throw new Error("No session found after successful OAuth. Please try logging in again.");
          }
        }
      } else if (authResult.type === "cancel") {
        console.log("User cancelled sign-in");
        throw new Error("Sign-in cancelled");
      } else if (authResult.type === "dismiss") {
        console.log("Browser dismissed");
        throw new Error("Sign-in dismissed");
      } else {
        console.error("Unexpected auth result type:", authResult.type);
        throw new Error("OAuth failed with unexpected result");
      }
    } catch (e: any) {
      console.error("=== Login Error ===");
      console.error("Error:", e);
      console.error("Error message:", e?.message);
      console.error("Error stack:", e?.stack);
      setError(e?.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
