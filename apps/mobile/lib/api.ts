import { authClient } from "./auth-client"; 

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://f2c05ede579e.ngrok-free.app";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const session = await authClient.getSession();
  
  const headers = new Headers(options.headers);
  if (session?.data?.session?.token) {
    headers.set("Authorization", `Bearer ${session.data.session.token}`);
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
