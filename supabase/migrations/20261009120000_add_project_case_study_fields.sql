-- Optional case-study columns. Existing rows stay valid: text fields are
-- nullable, and metrics defaults to an empty array so nothing new renders
-- until a field is filled in the admin.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS problem text,
  ADD COLUMN IF NOT EXISTS solution text,
  ADD COLUMN IF NOT EXISTS result text,
  ADD COLUMN IF NOT EXISTS metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS before_image text,
  ADD COLUMN IF NOT EXISTS after_image text,
  ADD COLUMN IF NOT EXISTS testimonial_quote text,
  ADD COLUMN IF NOT EXISTS testimonial_author text,
  ADD COLUMN IF NOT EXISTS testimonial_role text;

-- Keep any problem / solution / result already stored in case_study jsonb.
UPDATE public.projects
SET
  problem = COALESCE(problem, NULLIF(btrim(case_study ->> 'problem'), '')),
  solution = COALESCE(solution, NULLIF(btrim(case_study ->> 'solution'), '')),
  result = COALESCE(result, NULLIF(btrim(case_study ->> 'result'), ''))
WHERE case_study IS NOT NULL
  AND jsonb_typeof(case_study) = 'object';