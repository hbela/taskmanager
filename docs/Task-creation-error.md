Great, thanks for the Metro log — this actually pinpoints the issue very precisely.
Short version: **your mobile app is sending auth data in a way that your API does NOT accept**, so the server *correctly* returns 401.

Let’s break it down and then fix it the *right* way for Expo/mobile.

---

## What your log proves (important)

### ✅ On the mobile side

```
hasSession: true
hasToken: true
tokenPreview: "Ldvul5ph07zMTMFcDspp..."
Sending cookie: better-auth.session_token=Ldvul5ph07zMTMFcDspp...
```

So:

* You **do have a valid session token**
* You **are attaching it manually**
* Your client logic is working as designed

---

### ❌ On the API side

You still get:

```
401 Unauthorized
```

That means:

> **The API does not recognize `better-auth.session_token` from a mobile client**

This is **not a CORS problem anymore**
This is **not a cookie-forwarding problem anymore**

This is an **auth mechanism mismatch**.

---

## 🚨 The real root cause (very important)

### better-auth is **COOKIE-FIRST**

It expects:

* Browser
* Same-origin or cross-origin cookies
* Secure / HttpOnly cookies
* Automatic cookie handling

### React Native / Expo is **NOT a browser**

* No cookie jar
* No SameSite
* No Secure cookie semantics
* Manual headers ≠ browser cookies

👉 **Sending a `Cookie:` header from React Native does NOT recreate a browser session**

That’s why:

```
Session: null
```

on the API side, even though the token exists in DB.

---

## ✅ The ONLY correct solution for mobile

### 🔐 Use **Bearer token auth** for mobile

Keep **cookie-based auth for web**
Use **token-based auth for mobile**

This is the industry-standard split.

---

## ✅ How to fix it (step by step)

### 1️⃣ Stop sending cookies from Expo ❌

This is wrong for mobile:

```ts
headers: {
  Cookie: `better-auth.session_token=${token}`,
}
```

Remove it.

---

### 2️⃣ Send the token as Authorization header ✅

```ts
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
}
```

✅ This works reliably in React Native
✅ No cookie semantics involved

---

### 3️⃣ Update your API auth middleware

Your API must support **both**:

* cookies (web)
* bearer tokens (mobile)

#### Example (Fastify / Express style):

```ts
const authHeader = req.headers.authorization;
const tokenFromHeader = authHeader?.startsWith("Bearer ")
  ? authHeader.slice(7)
  : null;

const token =
  tokenFromHeader ??
  req.cookies?.["better-auth.session_token"];

const session = token
  ? await auth.api.getSession({ token })
  : null;

if (!session) {
  return reply.status(401).send({ error: "Unauthorized" });
}
```

✅ Web → cookie
✅ Mobile → bearer token
✅ Same DB session table

---

### 4️⃣ Store the token properly on mobile

Use **SecureStore**, not AsyncStorage:

```ts
import * as SecureStore from "expo-secure-store";

await SecureStore.setItemAsync("sessionToken", token);
```

Then:

```ts
const token = await SecureStore.getItemAsync("sessionToken");
```

---

## 🧠 Why your current approach will never work

| Attempt                        | Why it fails         |
| ------------------------------ | -------------------- |
| Manually setting Cookie header | RN ≠ browser         |
| `credentials: include`         | Ignored in RN        |
| Secure cookies                 | HTTPS + browser only |
| SameSite                       | Browser-only feature |

So the 401 is **correct behavior**.

---

## ✅ What you have now (good news)

* Auth DB is correct ✅
* Session creation works ✅
* Token exists and is valid ✅
* API logic is sound ✅

You just need to **route auth differently for mobile**.

---

## 🏁 Final recommendation (clean architecture)

| Platform      | Auth method      |
| ------------- | ---------------- |
| Web (Next.js) | HttpOnly cookies |
| Mobile (Expo) | Bearer token     |
| API           | Accept both      |

This is exactly how:

* GitHub
* Linear
* Notion
* Slack

handle mobile vs web auth.


