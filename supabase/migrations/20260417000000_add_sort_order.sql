-- Add sort_order to pm_tasks for within-column card reordering
ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER;
