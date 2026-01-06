# Debugging Guide: Blank Screen After Login

## Changes Made

Added comprehensive logging to help diagnose the blank screen issue:

### 1. **Enhanced Login Screen** (`apps/mobile/app/auth/login.tsx`)
- ✅ Added detailed console logs for every step of OAuth flow
- ✅ Increased wait time from 1s to 2s for session to be saved
- ✅ Removed unnecessary `result?.data?.redirect` check
- ✅ Added logging for all authResult types (success, cancel, dismiss)
- ✅ Increased Snackbar duration to 5s for better error visibility

### 2. **Enhanced Root Index** (`apps/mobile/app/index.tsx`)
- ✅ Added logging for authentication check flow
- ✅ Added visual feedback ("Checking authentication..." text)
- ✅ Added logging for redirect decisions

## How to Debug

### Step 1: Clear the App and Restart

```bash
# In the mobile directory
npx expo start --clear
```

### Step 2: Try Logging In Again

Watch the Metro bundler console for these log messages:

#### **Expected Flow:**

```
=== Starting Google OAuth ===
Sign-in result: { data: { url: "...", redirect: true } }
Opening OAuth URL in browser...
URL: https://accounts.google.com/...
Browser result type: success
Browser result: { type: "success", url: "taskmanager://..." }
OAuth completed successfully!
Callback URL: taskmanager://...
Waiting for session to be saved...
Checking for session...
Session check result: { data: { user: {...}, session: {...} } }
✅ Session found! User: your-email@gmail.com
Redirecting to app...
=== Index: Checking authentication ===
Index: Fetching session...
Index: Session result: { data: { user: {...}, session: {...} } }
Index: Has session? true
Index: User authenticated: your-email@gmail.com
Index: Render - isAuthenticated: true
Index: Redirecting to: /(app)
```

#### **If You See This (Problem):**

```
OAuth completed successfully!
Callback URL: taskmanager://...
Waiting for session to be saved...
Checking for session...
Session check result: { data: null }
❌ No session found after OAuth
```

**This means:** The session is created on the server but not being retrieved by the mobile app.

### Step 3: Check What Logs You See

After trying to log in, **copy all the Metro console logs** and share them. Look for:

1. ✅ **OAuth URL opened?** - Should see "Opening OAuth URL in browser..."
2. ✅ **Browser returned success?** - Should see "Browser result type: success"
3. ❌ **Session found?** - This is likely where it's failing

## Possible Issues & Solutions

### Issue 1: Session Not Found After OAuth

**Symptoms:**
- OAuth completes successfully
- Browser returns to app
- But `authClient.getSession()` returns `{ data: null }`

**Possible Causes:**
1. Session cookie not being saved by Better-Auth Expo plugin
2. Session token not being stored in SecureStore
3. API URL mismatch between login and session check

**Solution:**
Check the auth-client configuration:

```typescript
// apps/mobile/lib/auth-client.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://f2c05ede579e.ngrok-free.app";

export const authClient = createAuthClient({
  baseURL: API_URL,  // Make sure this matches your ngrok URL
  plugins: [
    expoClient({
      scheme: "taskmanager",
      storage: SecureStore,
    }),
  ],
});
```

### Issue 2: Redirect Not Working

**Symptoms:**
- Session is found
- But screen stays blank

**Solution:**
Check the (app)/_layout.tsx to ensure it's not blocking:

```typescript
// Should redirect to login if no session
if (!session) {
  return <Redirect href="/auth/login" />;
}
```

### Issue 3: ngrok URL Changed

**Symptoms:**
- OAuth fails completely
- Or 404 errors in server logs

**Solution:**
Update the ngrok URL in:
1. `apps/mobile/lib/auth-client.ts`
2. `packages/auth/index.ts` (trustedOrigins)
3. Restart both API server and mobile app

## Quick Fixes to Try

### Fix 1: Force Session Refresh

Add this to login.tsx after OAuth success:

```typescript
// Force a fresh session check
await authClient.session.refetch();
const session = await authClient.getSession();
```

### Fix 2: Check SecureStore

Add this to see if the token is being stored:

```typescript
import * as SecureStore from "expo-secure-store";

// After OAuth
const token = await SecureStore.getItemAsync("better-auth.session_token");
console.log("Token in SecureStore:", token);
```

### Fix 3: Verify API URL

Add this at the start of login:

```typescript
console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
```

## Next Steps

1. **Try logging in again** with the new logging
2. **Copy the full Metro console output**
3. **Share the logs** so we can see exactly where it's failing
4. **Check the server logs** to see if the session is being created

The detailed logs will tell us exactly what's happening!
