import { authClient } from "./auth-client"; 
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://f2c05ede579e.ngrok-free.app";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  
  // Get the session from Better-Auth
  const session = await authClient.getSession();
  
  // Debug: Check what's in SecureStore
  const storedToken = await SecureStore.getItemAsync("better-auth.session_token");
  
  console.log("apiFetch session check:", {
    endpoint,
    hasSession: !!session,
    hasToken: !!session?.data?.session?.token,
    tokenPreview: session?.data?.session?.token?.substring(0, 20) + "...",
    storedToken: storedToken?.substring(0, 20) + "..." || "NONE",
  });
  
  // In React Native, we need to manually send the session token as a cookie
  // because fetch doesn't have a cookie jar like browsers do
  if (session?.data?.session?.token) {
    const token = session.data.session.token;
    headers.set("Cookie", `better-auth.session_token=${token}`);
    console.log("Sending cookie:", `better-auth.session_token=${token.substring(0, 20)}...`);
  }
  
  headers.set("Content-Type", "application/json");
  headers.set("ngrok-skip-browser-warning", "true"); // Skip ngrok warning page

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Still include this for consistency
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network response was not ok" }));
    console.error("API Error:", { status: response.status, error });
    throw new Error(error.message || "Network response was not ok");
  }

  return response.json();
};
