import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.50:3000"; // Changed localhost to IP for mobile

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "taskmanager", // Matches app.json scheme
      storage: SecureStore,
    }),
  ],
});
