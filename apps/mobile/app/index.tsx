import { Redirect } from "expo-router";
import { authClient } from "../lib/auth-client";
import { View, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";

export default function Index() {
  // Use the reactive useSession hook instead of getSession()
  // This will automatically update when the session changes (e.g., after OAuth callback)
  const { data: session, isPending } = authClient.useSession();

  console.log("Index: Render - isPending:", isPending, "hasSession:", !!session);

  // Show loading while checking session
  if (isPending) {
    console.log("Index: Showing loading screen");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{ marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  // Redirect based on session state
  if (session) {
    console.log("Index: Session found, redirecting to /(app)");
    return <Redirect href="/(app)" />;
  } else {
    console.log("Index: No session, redirecting to /auth/login");
    return <Redirect href="/auth/login" />;
  }
}
