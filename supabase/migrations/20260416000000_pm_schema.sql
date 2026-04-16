-- PM Tool Schema Migration
-- Tables prefixed with pm_ to coexist with SuccessionOS tables in shared Supabase project

-- =============================================
-- pm_projects
-- =============================================
CREATE TABLE IF NOT EXISTS pm_projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL UNIQUE,
  description      TEXT,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- pm_team_members
-- =============================================
CREATE TABLE IF NOT EXISTS pm_team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT NOT NULL UNIQUE,      -- lk, tl, ba1, ba2, ds, dj, d1..d4
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6B7280',   -- hex color for avatar
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- pm_milestones
-- =============================================
CREATE TABLE IF NOT EXISTS pm_milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  is_done     BOOLEAN NOT NULL DEFAULT false,
  done_at     TIMESTAMPTZ,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- pm_sprints
-- =============================================
CREATE TABLE IF NOT EXISTS pm_sprints (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  theme            TEXT,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- pm_epics
-- =============================================
CREATE TABLE IF NOT EXISTS pm_epics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  sprint_id  UUID REFERENCES pm_sprints(id) ON DELETE SET NULL,
  code       TEXT NOT NULL,    -- E01-Foundation, E02-Auth, ...
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  color      TEXT NOT NULL DEFAULT '#4F46E5',
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- pm_tasks
-- =============================================
CREATE TABLE IF NOT EXISTS pm_tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  sprint_id        UUID REFERENCES pm_sprints(id) ON DELETE SET NULL,
  epic_id          UUID REFERENCES pm_epics(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  assignee_id      UUID REFERENCES pm_team_members(id) ON DELETE SET NULL,
  day_label        TEXT,           -- e.g. "T2 20/4"
  type             TEXT NOT NULL DEFAULT 'dev' CHECK (type IN ('spec', 'story', 'design', 'dev', 'test', 'review', 'doc')),
  status           TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done', 'blocked')),
  priority         TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_hours  NUMERIC(5,1),
  actual_hours     NUMERIC(5,1),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- pm_comments
-- =============================================
CREATE TABLE IF NOT EXISTS pm_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES pm_tasks(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES pm_team_members(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- pm_blockers
-- =============================================
CREATE TABLE IF NOT EXISTS pm_blockers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      UUID NOT NULL REFERENCES pm_tasks(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  raised_by    UUID REFERENCES pm_team_members(id) ON DELETE SET NULL,
  raised_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ,
  resolved_by  UUID REFERENCES pm_team_members(id) ON DELETE SET NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

-- =============================================
-- Indexes for common queries
-- =============================================
CREATE INDEX IF NOT EXISTS idx_pm_milestones_project  ON pm_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_sprints_project     ON pm_sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_sprints_status      ON pm_sprints(status);
CREATE INDEX IF NOT EXISTS idx_pm_epics_project       ON pm_epics(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_epics_sprint        ON pm_epics(sprint_id);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_project       ON pm_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_sprint        ON pm_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_epic          ON pm_tasks(epic_id);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_assignee      ON pm_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_status        ON pm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_pm_comments_task       ON pm_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_pm_blockers_task       ON pm_blockers(task_id);

-- =============================================
-- Auto-update updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION pm_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pm_projects_updated_at
  BEFORE UPDATE ON pm_projects
  FOR EACH ROW EXECUTE FUNCTION pm_update_updated_at();

CREATE TRIGGER pm_tasks_updated_at
  BEFORE UPDATE ON pm_tasks
  FOR EACH ROW EXECUTE FUNCTION pm_update_updated_at();

-- =============================================
-- Views: progress helpers
-- =============================================

-- Sprint progress computed from tasks
CREATE OR REPLACE VIEW pm_sprint_progress AS
SELECT
  s.id AS sprint_id,
  s.name,
  COUNT(t.id) AS total_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'done') AS done_tasks,
  CASE WHEN COUNT(t.id) = 0 THEN 0
       ELSE ROUND(COUNT(t.id) FILTER (WHERE t.status = 'done') * 100.0 / COUNT(t.id))
  END AS progress_percent
FROM pm_sprints s
LEFT JOIN pm_tasks t ON t.sprint_id = s.id AND t.is_active = true
WHERE s.is_active = true
GROUP BY s.id, s.name;

-- Workload per member per sprint
CREATE OR REPLACE VIEW pm_member_workload AS
SELECT
  m.id AS member_id,
  m.code,
  m.name,
  m.role,
  m.color,
  t.sprint_id,
  COUNT(t.id) AS total_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'done') AS done_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'in-progress') AS in_progress_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'blocked') AS blocked_tasks
FROM pm_team_members m
LEFT JOIN pm_tasks t ON t.assignee_id = m.id AND t.is_active = true
WHERE m.is_active = true
GROUP BY m.id, m.code, m.name, m.role, m.color, t.sprint_id;
