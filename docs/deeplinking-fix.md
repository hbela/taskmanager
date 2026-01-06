Replace apps/mobile/app/index.tsx with the attached file
Replace apps/mobile/app/_layout.tsx with the attached file

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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { authClient } from '../lib/auth-client';
import * as Linking from 'expo-linking';

const queryClient = new QueryClient();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
  },
};

function AuthRedirectHandler() {
  const router = useRouter();
  const segments = useSegments();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === 'auth';

    console.log("AuthRedirectHandler: session=", !!session, "inAuthGroup=", inAuthGroup, "segments=", segments);

    if (session && inAuthGroup) {
      // User is signed in but on auth screen, redirect to app
      console.log("AuthRedirectHandler: Redirecting to /(app)");
      router.replace('/(app)');
    } else if (!session && !inAuthGroup && segments[0] !== undefined) {
      // User is not signed in and not on auth screen (and not on root), redirect to login
      console.log("AuthRedirectHandler: Redirecting to /auth/login");
      router.replace('/auth/login');
    }
  }, [session, isPending, segments]);

  return null;
}

function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links when app is opened from a link
    const handleDeepLink = (event: { url: string }) => {
      console.log("Deep link received:", event.url);
      
      // Parse the URL to handle different paths
      const url = Linking.parse(event.url);
      console.log("Parsed deep link:", url);
      
      // If the app was opened via deep link after OAuth, the session should be set
      // The AuthRedirectHandler will handle the redirect
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("App opened with URL:", url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style="auto" />
          <AuthRedirectHandler />
          <DeepLinkHandler />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ title: 'Login', headerShown: false }} />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
