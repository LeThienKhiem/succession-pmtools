-- Fix pm_tasks to match actual app field values
-- Run this in Supabase SQL Editor after the base schema migration.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. status: add 'outline' for the Archive column
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'pm_tasks'::regclass
    AND contype   = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%';
  IF cname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE pm_tasks DROP CONSTRAINT ' || quote_ident(cname);
  END IF;
END $$;

ALTER TABLE pm_tasks
  ADD CONSTRAINT pm_tasks_status_check
  CHECK (status IN ('todo', 'in-progress', 'done', 'blocked', 'outline'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. priority: add 'normal' and 'priority' which the app uses by default
--    Full set: critical | priority | normal | high | medium | low
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'pm_tasks'::regclass
    AND contype   = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%priority%';
  IF cname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE pm_tasks DROP CONSTRAINT ' || quote_ident(cname);
  END IF;
END $$;

ALTER TABLE pm_tasks
  ADD CONSTRAINT pm_tasks_priority_check
  CHECK (priority IN ('critical', 'priority', 'normal', 'high', 'medium', 'low'));

-- Also update the column default to match the app default
ALTER TABLE pm_tasks ALTER COLUMN priority SET DEFAULT 'normal';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. documents: text array of URLs attached to a task
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS documents TEXT[];
