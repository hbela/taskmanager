import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.50:3000";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // Get session token from SecureStore
  const token = await SecureStore.getItemAsync("session_token");
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network response was not ok" }));
    throw new Error(error.message || "Network response was not ok");
  }

  return response.json();
};
