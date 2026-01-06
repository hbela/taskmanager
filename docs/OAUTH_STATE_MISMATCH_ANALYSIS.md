# OAuth State Mismatch - Root Cause Analysis

## The Problem

The `state_mismatch` error occurs because:

1. **Mobile app calls** `/api/auth/sign-in/social`
   - Better-Auth creates a verification record with state `aZ4vxGRGtm-U4aCe3rqU63rCgQNXoUY7`
   - Stores it in the database with a short expiration (usually 5 minutes)

2. **WebBrowser opens** the Google OAuth URL
   - User logs in with Google
   - Google redirects to `/api/auth/callback/google?state=aZ4vxGRGtm-U4aCe3rqU63rCgQNXoUY7&code=...`

3. **Better-Auth tries to verify** the state
   - Looks up the verification record in the database
   - **FAILS** because:
     - The state was created in a different session context
     - No cookies are being sent with the callback request
     - Better-Auth can't link the callback to the original request

## Why It Works on Web

On the web app:
- Browser automatically sends cookies with every request
- Better-Auth can track the session across requests
- The state verification succeeds

## Why It Fails on Mobile

On mobile with `WebBrowser.openAuthSessionAsync()`:
- Each request is isolated
- No automatic cookie handling
- Better-Auth can't maintain session context

## Solutions

### Option 1: Use Better-Auth Expo Plugin Properly ✅ RECOMMENDED

The `@better-auth/expo` plugin is designed to solve this, but we need to use it correctly:

1. **Don't call `/api/auth/sign-in/social` directly**
2. **Use the authClient.signIn.social() method** (but it hangs - this is a bug)
3. **Alternative**: Use a custom WebView that maintains cookies

### Option 2: Custom WebView with Cookie Support

Instead of `WebBrowser.openAuthSessionAsync()`, use `react-native-webview`:
- Maintains cookies across requests
- Better-Auth can track the session
- State verification will succeed

### Option 3: Modify Better-Auth Configuration

Increase the state expiration time and disable strict origin checking:

```typescript
// packages/auth/index.ts
export const auth = betterAuth({
  // ... existing config
  advanced: {
    useSecureCookies: false, // Already set
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // 1 hour
    },
  },
});
```

### Option 4: Use Web-Based Login Flow

Create a simple web page for login and use it in a WebView:
1. Mobile app opens WebView to `/mobile-login`
2. Web page handles OAuth with cookies
3. After success, redirects to `taskmanager://success?token=...`
4. Mobile app extracts token and stores it

## Recommended Next Step

Since `authClient.signIn.social()` hangs and direct API calls cause state mismatch, I recommend **Option 4: Web-Based Login Flow**.

This is the most reliable approach for Expo apps and is used by many production apps.

Would you like me to implement this solution?
