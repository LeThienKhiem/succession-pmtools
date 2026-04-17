-- pm_knowledge: shared document knowledge base, used by PM Bot as persistent context
CREATE TABLE IF NOT EXISTS pm_knowledge (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  doc_name    TEXT NOT NULL,
  doc_type    TEXT NOT NULL DEFAULT 'doc',
  content     TEXT NOT NULL,
  file_size   INTEGER,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pm_knowledge_project
  ON pm_knowledge(project_id) WHERE is_active = true;
