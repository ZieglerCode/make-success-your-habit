ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS provisioning_status text NOT NULL DEFAULT 'pending'
    CHECK (provisioning_status IN ('pending', 'provisioning', 'ready', 'failed'));

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS provisioned_at timestamptz;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS provisioning_error text;

CREATE INDEX IF NOT EXISTS projects_provisioning_status_idx
  ON projects(provisioning_status);
