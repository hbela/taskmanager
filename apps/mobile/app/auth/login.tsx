import { Button, Text, Snackbar } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

// This is required for the browser to close properly after OAuth
WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.204:3000";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    setError("");
    
    try {
      console.log("Starting Google OAuth with Expo AuthSession...");
      
      // Step 1: Get the authorization URL from Better-Auth
      const authResponse = await fetch(`${API_URL}/api/auth/sign-in/social`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Origin": API_URL,
        },
        body: JSON.stringify({
          provider: "google",
          callbackURL: AuthSession.makeRedirectUri({ scheme: "taskmanager" }),
        }),
      });
      
      const authData = await authResponse.json();
      console.log("Auth data:", authData);
      
      if (!authData.url) {
        throw new Error("No authorization URL received");
      }
      
      // Step 2: Open the OAuth URL in browser
      console.log("Opening browser for OAuth...");
      const result = await WebBrowser.openAuthSessionAsync(
        authData.url,
        AuthSession.makeRedirectUri({ scheme: "taskmanager" })
      );
      
      console.log("OAuth result:", result);
      
      if (result.type === "success" && result.url) {
        console.log("OAuth successful, callback URL:", result.url);
        
        // Step 3: The callback URL should contain the session token
        // Parse the URL to extract it
        const url = new URL(result.url);
        const token = url.searchParams.get("token");
        
        if (token) {
          console.log("Session token found in callback URL");
          await SecureStore.setItemAsync("session_token", token);
          console.log("Token stored, redirecting to app...");
          router.replace("/(app)");
        } else {
          // Fallback: Try to get session from server
          console.log("No token in URL, trying to fetch session from server...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const sessionResponse = await fetch(`${API_URL}/api/auth/get-session`);
          const sessionData = await sessionResponse.json();
          console.log("Session data from server:", sessionData);
          
          if (sessionData?.session?.token) {
            console.log("Session token found from server");
            await SecureStore.setItemAsync("session_token", sessionData.session.token);
            router.replace("/(app)");
          } else {
            throw new Error("No session token received");
          }
        }
      } else if (result.type === "cancel") {
        console.log("User cancelled OAuth");
        setError("Sign-in cancelled");
      } else {
        throw new Error("OAuth failed");
      }
      
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
