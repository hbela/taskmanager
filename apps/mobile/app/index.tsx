import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { View, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("=== Index: Checking authentication ===");
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("Index: Fetching session...");
      const session = await authClient.getSession();
      console.log("Index: Session result:", JSON.stringify(session, null, 2));
      
      const hasSession = !!session.data;
      console.log("Index: Has session?", hasSession);
      
      if (hasSession) {
        console.log("Index: User authenticated:", session.data?.user?.email);
      } else {
        console.log("Index: No session found, user not authenticated");
      }
      
      setIsAuthenticated(hasSession);
    } catch (error) {
      console.error("Index: Auth check error:", error);
      setIsAuthenticated(false);
    }
  };

  console.log("Index: Render - isAuthenticated:", isAuthenticated);

  if (isAuthenticated === null) {
    console.log("Index: Showing loading screen");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{ marginTop: 16 }}>Checking authentication...</Text>
      </View>
    );
  }

  const redirectPath = isAuthenticated ? "/(app)" : "/auth/login";
  console.log("Index: Redirecting to:", redirectPath);
  
  return <Redirect href={redirectPath} />;
}

