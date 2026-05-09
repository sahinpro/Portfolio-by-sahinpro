-- Portfolio projects: support expanded categories, frameworks, and CMS platforms.
--
-- Supabase SQL Editor often shows "Success. No rows returned" for statements that
-- do not return a result set. For UPDATEs, that does NOT mean failure — it only
-- means there is no SELECT-style output. If zero projects matched your WHERE
-- clauses, the updates still "succeeded" but changed 0 rows (empty table or
-- data already migrated).
--
-- OPTIONAL: run these first to see what you have (paste in a new query):
--   SELECT COUNT(*) AS project_count FROM public.projects;
--   SELECT category, COUNT(*) FROM public.projects GROUP BY category;
--   SELECT build_kind, custom_framework, COUNT(*) FROM public.projects GROUP BY 1, 2;

-- Example: widen CMS platform (adjust constraint name if yours differs)
-- ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_cms_platform_check;
-- ALTER TABLE public.projects ADD CONSTRAINT projects_cms_platform_check
--   CHECK (cms_platform IS NULL OR cms_platform = ANY (ARRAY['wordpress','shopify','wix']::text[]));

-- Example: widen custom_framework (adjust constraint name if yours differs)
-- ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_custom_framework_check;
-- ALTER TABLE public.projects ADD CONSTRAINT projects_custom_framework_check
--   CHECK (custom_framework IS NULL OR custom_framework = ANY (ARRAY[
--     'react','next','vue','other',
--     'react_vanilla','vanilla_js'
--   ]::text[]));

-- Backfill legacy categories → new labels (one statement; 0 rows if nothing to change)
UPDATE public.projects
SET category = CASE category
  WHEN 'Full Stack' THEN 'Web Development'
  WHEN 'Frontend' THEN 'Front-end Web Design'
  WHEN 'CMS' THEN 'E-commerce'
  ELSE category
END
WHERE category IN ('Full Stack', 'Frontend', 'CMS');

-- Legacy framework slugs → new vocabulary (custom builds only)
UPDATE public.projects
SET custom_framework = 'react_vanilla'
WHERE build_kind = 'custom' AND custom_framework = 'react';

UPDATE public.projects
SET custom_framework = 'vanilla_js'
WHERE build_kind = 'custom' AND custom_framework IN ('vue', 'other');
