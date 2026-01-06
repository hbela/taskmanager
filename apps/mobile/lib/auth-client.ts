import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://f2c05ede579e.ngrok-free.app";

console.log("Auth Client: Initializing with API URL:", API_URL);

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    headers: {
      "ngrok-skip-browser-warning": "true",  // Skip ngrok browser warning page
    },
  },
  plugins: [
    expoClient({
      scheme: "taskmanager",
      storage: SecureStore,
    }),
  ],
});

console.log("Auth Client: Initialized successfully");
