-- Standalone testimonials, assigned to at most one project.
-- Run this in the Supabase SQL editor before deploying the matching app code.

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  client_name text NOT NULL DEFAULT 'Andro',
  client_role text,
  client_photo text,
  project_id uuid REFERENCES public.projects (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS testimonials_one_per_project
  ON public.testimonials (project_id)
  WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS testimonials_updated_at_idx
  ON public.testimonials (updated_at DESC);

-- Copy quotes that were previously stored as JSON on each project.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'testimonial'
  ) THEN
    INSERT INTO public.testimonials (
      quote,
      client_name,
      client_role,
      client_photo,
      project_id
    )
    SELECT
      trim(testimonial ->> 'quote'),
      coalesce(nullif(trim(testimonial ->> 'client_name'), ''), ''),
      nullif(trim(testimonial ->> 'client_role'), ''),
      coalesce(
        nullif(trim(testimonial ->> 'client_photo'), ''),
        nullif(trim(testimonial ->> 'client_avatar'), '')
      ),
      id
    FROM public.projects
    WHERE testimonial IS NOT NULL
      AND jsonb_typeof(testimonial) = 'object'
      AND coalesce(trim(testimonial ->> 'quote'), '') <> ''
      AND NOT EXISTS (
        SELECT 1
        FROM public.testimonials existing
        WHERE existing.project_id = projects.id
      );

    ALTER TABLE public.projects DROP COLUMN testimonial;
  END IF;
END $$;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS testimonials_select_public ON public.testimonials;
CREATE POLICY testimonials_select_public
  ON public.testimonials
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS testimonials_insert_authenticated ON public.testimonials;
CREATE POLICY testimonials_insert_authenticated
  ON public.testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS testimonials_update_authenticated ON public.testimonials;
CREATE POLICY testimonials_update_authenticated
  ON public.testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS testimonials_delete_authenticated ON public.testimonials;
CREATE POLICY testimonials_delete_authenticated
  ON public.testimonials
  FOR DELETE
  TO authenticated
  USING (true);

GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
