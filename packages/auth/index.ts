import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { db } from "@taskmanager/database";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false, // We're using Google-only authentication
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    expo({
      baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    }), // Required for mobile deep linking & session propagation
  ],
  trustedOrigins: [
    "taskmanager://", // Mobile deep link
    "exp://",         // Expo development
    "http://localhost:3000", // Web app
    "http://localhost:3001", // Alternative web port
    "https://f2c05ede579e.ngrok-free.app", // ngrok tunnel for mobile development
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Auth = typeof auth;
