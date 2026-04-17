-- Shared decisions & direction notes, visible to whole team
CREATE TABLE IF NOT EXISTS pm_decisions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID        NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  category    TEXT        NOT NULL DEFAULT 'decision',  -- 'decision' | 'direction'
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL DEFAULT '',
  author_name TEXT        NOT NULL DEFAULT '',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pm_decisions_project ON pm_decisions(project_id);

CREATE TRIGGER pm_decisions_updated_at
  BEFORE UPDATE ON pm_decisions
  FOR EACH ROW EXECUTE FUNCTION pm_update_updated_at();
