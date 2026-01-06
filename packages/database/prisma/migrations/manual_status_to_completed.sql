-- Migration: Change task.status (String) to task.completed (Boolean)
-- WARNING: This migration will drop the 'status' column and add 'completed' column

-- Step 1: Add the new 'completed' column with default value
ALTER TABLE "task" ADD COLUMN "completed" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Migrate existing data
-- Convert status values to completed boolean:
-- "DONE" or "COMPLETED" -> true
-- "TODO" or "IN_PROGRESS" or anything else -> false
UPDATE "task" 
SET "completed" = CASE 
  WHEN "status" IN ('DONE', 'COMPLETED') THEN true 
  ELSE false 
END;

-- Step 3: Drop the old 'status' column
ALTER TABLE "task" DROP COLUMN "status";
