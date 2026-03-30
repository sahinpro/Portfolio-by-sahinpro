-- Screenshot gallery for projects (ordered list of public image URLs, JSON array)
alter table public.projects
  add column if not exists screenshot_urls jsonb not null default '[]'::jsonb;

comment on column public.projects.screenshot_urls is 'Ordered list of screenshot image URLs (JSON array of strings)';
