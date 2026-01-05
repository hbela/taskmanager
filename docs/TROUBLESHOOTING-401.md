# Troubleshooting 401 Authentication Error

## Current Status

The API is receiving a cookie, but it's the wrong one:
```
cookie: '__Secure-better-auth.state=...'
Session: null
```

### Problem Analysis

1. **Wrong Cookie**: The API is receiving `__Secure-better-auth.state` (OAuth state) instead of `better-auth.session_token` (actual session)
2. **No Session**: `Session: null` means Better-Auth can't find a valid session
3. **User Not Logged In**: The mobile app likely doesn't have a valid session stored

## Root Cause

**You need to log in again on the mobile app!**

The `state` cookie is from the OAuth flow, but the actual session token cookie is missing. This happens when:
- The login flow didn't complete successfully
- The session wasn't stored properly in SecureStore
- The session expired

## Solution Steps

### Step 1: Check if you're logged in

Run the mobile app and check the console logs. You should see:

```javascript
Dashboard session check: {
  hasSession: true,
  hasToken: true,
  token: "abc123..."
}
```

If you see `hasSession: false`, you need to log in.

### Step 2: Log out and log in again

1. **Add a logout button** to your dashboard (temporary for debugging)
2. **Log out** completely
3. **Log in again** with Google
4. **Check the logs** to confirm session is stored

### Step 3: Verify the session token is being sent

When you try to create a task, check the logs:

```javascript
apiFetch session check: {
  endpoint: "/v1/tasks",
  hasSession: true,
  hasToken: true,
  tokenPreview: "abc123..."
}
```

### Step 4: Check API logs

The API should now show:

```
Auth Headers: {
  authorization: undefined,
  cookie: 'better-auth.session_token=abc123...'  // Correct cookie!
}
Session: { user: { id: '...', email: '...' } }  // Valid session!
```

## Quick Fix: Add Logout Button

Add this to your dashboard temporarily:

\`\`\`tsx
import { authClient } from '../../lib/auth-client';
import { router } from 'expo-router';

// In your component:
const handleLogout = async () => {
  await authClient.signOut();
  router.replace('/auth/login');
};

// In your JSX:
<Button onPress={handleLogout}>Logout (Debug)</Button>
\`\`\`

## Expected Flow

1. User clicks "Sign in with Google"
2. OAuth flow completes
3. Better-Auth creates a session
4. Session token is stored in SecureStore (via expo plugin)
5. `authClient.getSession()` retrieves the token
6. `apiFetch` sends the token as a cookie
7. API validates the session ✅

## Common Issues

### Issue: Session not persisting
**Solution**: Make sure `@better-auth/expo` plugin is configured with SecureStore

### Issue: Wrong cookie being sent
**Solution**: Log in again - the OAuth state cookie is not the session cookie

### Issue: Session expires immediately
**Solution**: Check Better-Auth session configuration (currently set to 7 days)

## Debug Checklist

- [ ] Mobile app shows `hasSession: true` in console
- [ ] Mobile app shows `hasToken: true` in console
- [ ] apiFetch logs show token is being sent
- [ ] API logs show `better-auth.session_token` cookie (not `state`)
- [ ] API logs show `Session: { user: {...} }` (not `null`)
- [ ] Task creation returns 201 (not 401)
