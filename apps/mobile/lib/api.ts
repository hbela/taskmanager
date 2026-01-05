import { authClient } from "./auth-client"; 

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://f2c05ede579e.ngrok-free.app";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  
  // Get the session from Better-Auth
  const session = await authClient.getSession();
  
  console.log("apiFetch session check:", {
    endpoint,
    hasSession: !!session,
    hasToken: !!session?.data?.session?.token,
    tokenPreview: session?.data?.session?.token?.substring(0, 20) + "...",
  });
  
  // ✅ Mobile: Use Bearer token instead of cookies
  // React Native doesn't have a cookie jar, so we send the token as Authorization header
  if (session?.data?.session?.token) {
    const token = session.data.session.token;
    headers.set("Authorization", `Bearer ${token}`);
    console.log("Sending Bearer token:", token.substring(0, 20) + "...");
  }
  
  headers.set("Content-Type", "application/json");
  headers.set("ngrok-skip-browser-warning", "true"); // Skip ngrok warning page

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network response was not ok" }));
    console.error("API Error:", { status: response.status, error });
    throw new Error(error.message || "Network response was not ok");
  }

  return response.json();
};
