# Analysis of Mobile Authentication Issue

I have analyzed your project and identified the root cause of the `state_mismatch` error in your mobile app's Google authentication. This document outlines the problem and provides a step-by-step guide to fix it.

## 1. Root Cause: Incorrect Authentication Flow

The primary issue lies in `apps/mobile/app/auth/login.tsx`. The current implementation manually handles the OAuth 2.0 flow by making a `fetch` request and using `WebBrowser.openAuthSessionAsync`. This approach bypasses the `better-auth` client-side library, which is specifically designed to manage the complexities of authentication state and session handling in an Expo environment.

By not using the `authClient`, the `state` parameter that is generated on the server to prevent CSRF attacks is not correctly passed and verified during the OAuth callback, leading to the `state_mismatch` error.

## 2. Recommended Solution

To resolve this, you need to refactor the `login.tsx` file to use the `authClient` that is already configured in your project. This will ensure the authentication flow is handled correctly by the `better-auth` library.

### Step 1: Update the Login Component

Replace the content of `apps/mobile/app/auth/login.tsx` with the following code. This version uses `authClient.signIn.social()` to initiate the Google sign-in process, which is the correct approach.

```typescript
import { Button, Text, Snackbar } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { authClient } from "../../lib/auth-client"; // Import the configured auth client

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
      });

      if (result?.session) {
        console.log("Sign-in successful, redirecting to app...");
        router.replace("/(app)");
      } else {
        throw new Error(result?.error || "Sign-in failed. Please try again.");
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
      <Text variant=\"headlineMedium\" style={styles.title}>Welcome Back</Text>
      <Button
        mode=\"contained\"
        onPress={handleLogin}
        icon=\"google\"
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
```

### Step 2: Update API URL Configuration

To avoid hardcoding IP addresses, it's best to use the ngrok URL provided by your setup. Update the `API_URL` in `apps/mobile/lib/auth-client.ts` to use your ngrok URL. You should use an environment variable for this.

```typescript
// apps/mobile/lib/auth-client.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://f2c05ede579e.ngrok-free.app"; // Use your ngrok URL
```

### Step 3: Enhance Server Configuration

While your server configuration is mostly correct, you can make it more robust for development by adding wildcards to your `trustedOrigins` in `packages/auth/index.ts`.

```typescript
// packages/auth/index.ts
export const auth = betterAuth({
  // ... other config
  trustedOrigins: [
    "taskmanager://", // Mobile deep link
    "exp://*",         // Expo development wildcard
    "http://localhost:3000", // Web app
    "http://localhost:3001", // Alternative web port
    "https://f2c05ede579e.ngrok-free.app", // ngrok tunnel for mobile development
  ],
  // ... other config
});
```

### Step 4: Add Metro Configuration

To ensure that the `better-auth` packages are correctly resolved by the Metro bundler, create a `metro.config.js` file in the root of your `apps/mobile` directory with the following content:

```javascript
// apps/mobile/metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
```

After creating this file, clear the Metro cache by running `npx expo start --clear`.

## Summary of Changes

| File | Change |
| :--- | :--- |
| `apps/mobile/app/auth/login.tsx` | Replaced manual OAuth flow with `authClient.signIn.social()` |
| `apps/mobile/lib/auth-client.ts` | Updated `API_URL` to use the ngrok URL |
| `packages/auth/index.ts` | Added wildcard for `exp://` in `trustedOrigins` |
| `apps/mobile/metro.config.js` | Created file to enable `unstable_enablePackageExports` |

By implementing these changes, you will be using the `better-auth` library as intended, which will resolve the `state_mismatch` error and provide a more stable and secure authentication flow for your mobile app.
