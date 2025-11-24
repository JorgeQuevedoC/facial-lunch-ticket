-- ============================================================
-- Supabase Database Setup
-- Sistema de Comedor Industrial
-- ============================================================

-- 1. Create employees table
-- The id must match the PIN configured in the ZKTeco device
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- 2. Create meals_taken table
CREATE TABLE IF NOT EXISTS meals_taken (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create unique constraint to enforce one meal per employee per day
CREATE UNIQUE INDEX IF NOT EXISTS meals_unique_daily
ON meals_taken (employee_id, (timestamp::date));

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meals_timestamp ON meals_taken(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_meals_employee ON meals_taken(employee_id);

-- 5. Disable Row Level Security (RLS) for local network deployment
-- WARNING: Only do this if you're running on an isolated local network!
-- For production/internet-facing deployments, configure proper RLS policies instead.
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE meals_taken DISABLE ROW LEVEL SECURITY;

-- 6. Insert sample employees (OPTIONAL - for testing)
-- IMPORTANT: The employee IDs must match the PINs in your ZKTeco device!
-- Remove or modify these based on your actual employees
INSERT INTO employees (id, name, active) VALUES
  (1, 'Juan Pérez', true),
  (2, 'María González', true),
  (3, 'Carlos López', true),
  (23, 'Ana Martínez', true),
  (100, 'Test Employee', true)
ON CONFLICT (id) DO NOTHING;
