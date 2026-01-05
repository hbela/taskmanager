import { authClient } from "./auth-client"; 

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const session = await authClient.getSession();
  
  const headers = new Headers(options.headers);
  if (session?.data?.session?.token) {
    // Better-Auth token for compatibility if needed, though cookies usually handle it for web
    // headers.set("Authorization", `Bearer ${session.data.session.token}`);
  }
  
  // For web, we rely on cookies mostly, but let's send JSON content type
  headers.set("Content-Type", "application/json");

  // Important: Credentials include for cookies
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network response was not ok" }));
    throw new Error(error.message || "Network response was not ok");
  }

  return response.json();
};
