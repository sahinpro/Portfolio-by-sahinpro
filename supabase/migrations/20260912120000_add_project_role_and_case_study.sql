-- Optional attribution + case-study fields for projects.
-- Nullable so existing rows keep working without backfill.
ALTER TABLE projects
  ADD COLUMN role_label text,
  ADD COLUMN case_study jsonb,
  ADD COLUMN testimonial jsonb;
