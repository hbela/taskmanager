# Database Migration Required: Task Model Update

## ⚠️ CRITICAL: Task Model Field Change

### The Issue

The **Prisma schema** and **Shared TypeScript schema** were misaligned:

- **Prisma (Database)**: Used `status: String` with values like "TODO", "IN_PROGRESS", "DONE"
- **Shared Schema**: Uses `completed: Boolean`
- **Mobile App**: Expects `completed: Boolean`

This mismatch would cause **runtime errors** when the mobile app tries to read/write tasks.

### The Fix

Updated `packages/database/prisma/schema.prisma`:

```diff
model task {
  id          String    @id
  title       String
  description String?
- status      String    @default("TODO")
+ completed   Boolean   @default(false)
  dueDate     DateTime?
  userId      String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime
  user        user      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

## Migration Options

### Option 1: Fresh Database (Recommended for Development)

If you don't have important data, reset the database:

```bash
cd packages/database

# Reset database and apply all migrations
pnpm prisma migrate reset --force

# Generate Prisma Client
pnpm prisma generate
```

### Option 2: Preserve Existing Data

If you have existing tasks you want to keep:

#### Step 1: Create the migration manually

```bash
cd packages/database

# Create a new migration directory
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_change_status_to_completed
```

#### Step 2: Apply the manual SQL migration

The SQL file has been created at:
`packages/database/prisma/migrations/manual_status_to_completed.sql`

You can either:

**A. Run it directly via psql:**
```bash
psql -U your_username -d gemini3 -f packages/database/prisma/migrations/manual_status_to_completed.sql
```

**B. Or create a proper Prisma migration:**
```bash
cd packages/database

# Create migration with custom SQL
pnpm prisma migrate dev --create-only --name change_status_to_completed

# Then edit the generated migration file and paste the SQL from manual_status_to_completed.sql

# Apply the migration
pnpm prisma migrate deploy
```

#### Step 3: Generate Prisma Client

```bash
cd packages/database
pnpm prisma generate
```

## Data Conversion Logic

The migration converts existing status values:

| Old Status Value | New Completed Value |
|-----------------|---------------------|
| "DONE"          | `true`              |
| "COMPLETED"     | `true`              |
| "TODO"          | `false`             |
| "IN_PROGRESS"   | `false`             |
| Any other value | `false`             |

## Verification

After migration, verify the schema:

```bash
cd packages/database
pnpm prisma studio
```

Check that:
1. ✅ The `task` table has a `completed` column (Boolean)
2. ✅ The `status` column is removed
3. ✅ Existing tasks have correct `completed` values

## Next Steps

After successful migration:

1. ✅ Restart your API server
2. ✅ Test the mobile app CRUD operations
3. ✅ Verify task creation, updates, and completion toggling work correctly

## Rollback (If Needed)

If you need to rollback:

```bash
cd packages/database

# Revert the schema.prisma change
git checkout packages/database/prisma/schema.prisma

# Reset to previous migration
pnpm prisma migrate reset
```

---

**Status**: Migration SQL created and ready to apply.
**Action Required**: Choose Option 1 or Option 2 above and run the commands.
