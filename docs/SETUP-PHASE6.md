# Phase 6 Setup Guide - Database & Environment Configuration

## ✅ Completed Steps

1. **Dependencies Installed** ✓
   - All workspace packages linked
   - Prisma 6.19.0 installed
   - Fastify and dependencies ready
   - Better-Auth configured

2. **Environment Files Created** ✓
   - `packages/database/.env`
   - `apps/api/.env`

3. **Prisma Client Generated** ✓
   - Prisma engines downloaded
   - Client generated successfully

## 🔧 Required Configuration

### Step 1: Configure Database Connection

You need a PostgreSQL database. Choose one of these options:

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `taskmanager`
3. Update `packages/database/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/taskmanager?schema=public"
   ```

#### Option B: Docker PostgreSQL (Recommended)
```bash
# Run PostgreSQL in Docker
docker run --name taskmanager-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskmanager \
  -p 5432:5432 \
  -d postgres:16

# The DATABASE_URL is already configured for this setup
```

#### Option C: Cloud Database (Neon, Supabase, Railway)
1. Create a PostgreSQL database on your preferred platform
2. Copy the connection string
3. Update `packages/database/.env` with your connection string

### Step 2: Configure Google OAuth

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "TaskManager"

4. **Configure Authorized Redirect URIs**
   Add these URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   taskmanager://
   ```

5. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Update both `.env` files:

   **packages/database/.env**:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

   **apps/api/.env**:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### Step 3: Generate Secure Secrets

Generate random secrets for production security:

```bash
# Generate a random secret (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update in both `.env` files:
```env
BETTER_AUTH_SECRET="your-generated-secret-here"
JWT_SECRET="your-generated-jwt-secret-here"
```

### Step 4: Run Database Migrations

Once your database is configured:

```bash
# Run migrations to create tables
pnpm db:migrate

# When prompted, name your migration (e.g., "init")
```

This will create all the necessary tables:
- `User` - User accounts
- `Session` - Active sessions
- `Account` - OAuth provider accounts
- `Task` - User tasks
- `Verification` - Email verification tokens

### Step 5: Verify Setup

```bash
# Check Prisma connection
pnpm --filter @taskmanager/database exec prisma db pull

# Open Prisma Studio to view your database
pnpm db:studio
```

## 📝 Environment Variables Reference

### packages/database/.env
```env
DATABASE_URL="postgresql://user:password@host:5432/taskmanager?schema=public"
BETTER_AUTH_SECRET="min-32-characters-random-string"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### apps/api/.env
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:5432/taskmanager?schema=public"
BETTER_AUTH_SECRET="same-as-database-env"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="same-as-database-env"
GOOGLE_CLIENT_SECRET="same-as-database-env"
JWT_SECRET="different-random-secret"
```

## 🚀 Next Steps

After completing Phase 6 setup:

1. **Test the API**
   ```bash
   pnpm dev:api
   ```
   Visit: http://localhost:3000/health

2. **Continue to Phase 7: Web App**
   - Create React web application
   - Implement Shadcn UI
   - Add authentication flow

3. **Continue to Phase 8: Mobile App**
   - Create Expo mobile application
   - Implement React Native Paper
   - Add mobile authentication

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
pnpm --filter @taskmanager/database exec prisma db pull
```

### Prisma Client Not Found
```bash
# Regenerate client
pnpm db:generate
```

### Migration Errors
```bash
# Reset database (WARNING: deletes all data)
pnpm --filter @taskmanager/database exec prisma migrate reset
```

### Port Already in Use
```bash
# Change PORT in apps/api/.env
PORT=3001
```

## ✅ Checklist

- [ ] PostgreSQL database running
- [ ] DATABASE_URL configured in both .env files
- [ ] Google OAuth credentials created
- [ ] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET configured
- [ ] BETTER_AUTH_SECRET generated and configured
- [ ] JWT_SECRET generated and configured
- [ ] Database migrations completed (`pnpm db:migrate`)
- [ ] Prisma Studio accessible (`pnpm db:studio`)
- [ ] API health check working (`http://localhost:3000/health`)

---

**Status**: Phase 6 infrastructure ready! ✅
**Next**: Configure your credentials and run migrations to proceed.
