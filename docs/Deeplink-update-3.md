The Fix
Updated _layout.tsx with two key changes:
1. Refetch session when app comes to foreground
TypeScript
useEffect(() => {
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log("App became active, refetching session...");
      refetch();
    }
  };
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription.remove();
}, [refetch]);
2. Refetch session when deep link is received
TypeScript
const handleDeepLink = useCallback(async (event: { url: string }) => {
  // Give the expo plugin a moment to store the session
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Refetch the session to pick up the newly stored token
  await refetch();
}, [refetch]);

The updated file:

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { authClient } from '../lib/auth-client';
import * as Linking from 'expo-linking';
import { AppState, AppStateStatus } from 'react-native';

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
  const { data: session, isPending, refetch } = authClient.useSession();

  // Refetch session when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log("App became active, refetching session...");
        refetch();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [refetch]);

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
  const { refetch } = authClient.useSession();

  const handleDeepLink = useCallback(async (event: { url: string }) => {
    console.log("Deep link received:", event.url);
    
    // Parse the URL to handle different paths
    const url = Linking.parse(event.url);
    console.log("Parsed deep link:", url);
    console.log("Query params:", url.queryParams);
    
    // Check if this is an OAuth callback (contains cookie or session token)
    // The expo plugin should have stored the session, so we just need to refetch
    if (url.hostname === '' || url.path === '' || url.path === '/') {
      console.log("OAuth callback detected, refetching session...");
      
      // Give the expo plugin a moment to store the session
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch the session to pick up the newly stored token
      await refetch();
      console.log("Session refetched after deep link");
    }
  }, [refetch]);

  useEffect(() => {
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
  }, [handleDeepLink]);

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
