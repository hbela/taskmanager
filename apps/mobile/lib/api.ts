import { authClient } from "./auth-client"; 

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://f2c05ede579e.ngrok-free.app";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const session = await authClient.getSession();
  
  const headers = new Headers(options.headers);
  
  // Better-Auth uses cookies for session management
  // We need to send the session token as a cookie, not as Authorization header
  if (session?.data?.session?.token) {
    headers.set("Cookie", `better-auth.session_token=${session.data.session.token}`);
  }
  
  headers.set("Content-Type", "application/json");
  headers.set("ngrok-skip-browser-warning", "true"); // Skip ngrok warning page


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
