-- Solar Website Generator: schema, RLS, storage bucket, atomic save function.
-- Run in Supabase Dashboard -> SQL Editor (or `supabase db push`).

create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------- websites
create table if not exists public.websites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,   -- null = single-admin mode; auth-ready
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  status text not null default 'draft' check (status in ('draft','published')),
  business_details jsonb not null default '{}',
  theme_config jsonb not null default '{}',
  layout_config jsonb not null default '{}',
  seo_config jsonb not null default '{}',
  section_order jsonb not null default '[]',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists websites_owner_idx on public.websites(owner_id);
create index if not exists websites_status_idx on public.websites(status);
drop trigger if exists websites_updated on public.websites;
create trigger websites_updated before update on public.websites for each row execute function public.set_updated_at();

-- ------------------------------------------------------------ child tables
create table if not exists public.website_navigation (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  label text not null,
  destination text not null default '',
  link_type text not null check (link_type in ('section','external','cta')),
  is_visible boolean not null default true,
  display_order int not null default 0
);
create table if not exists public.website_sections (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  section_type text not null,
  title text not null default '',
  content jsonb not null default '{}',
  is_enabled boolean not null default true,
  display_order int not null default 0,
  unique (website_id, section_type)
);
create table if not exists public.website_services (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  name text not null, description text not null default '', details text not null default '',
  image_path text not null default '', image_alt text not null default '', icon text not null default '',
  price_label text not null default '', cta_label text not null default '', cta_url text not null default '',
  is_visible boolean not null default true, display_order int not null default 0
);
create table if not exists public.website_projects (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  name text not null, description text not null default '', location text not null default '', category text not null default '',
  image_paths jsonb not null default '[]', metadata jsonb not null default '{}',
  is_visible boolean not null default true, display_order int not null default 0
);
create table if not exists public.website_testimonials (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  customer_name text not null, testimonial text not null default '', photo_path text not null default '', photo_alt text not null default '',
  company text not null default '', location text not null default '',
  rating int check (rating between 0 and 5), source_url text not null default '',
  is_visible boolean not null default true, display_order int not null default 0
);
create table if not exists public.website_faqs (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  question text not null, answer text not null default '',
  is_visible boolean not null default true, display_order int not null default 0
);
create table if not exists public.website_leads (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  name text not null, phone text, email text, property_type text, monthly_bill numeric(12,2),
  postal_code text, city text, service_interest text, message text,
  source text not null check (source in ('hero','final_cta')),
  created_at timestamptz not null default now()
);
create index if not exists nav_site_idx on public.website_navigation(website_id, display_order);
create index if not exists sections_site_idx on public.website_sections(website_id, display_order);
create index if not exists services_site_idx on public.website_services(website_id, display_order);
create index if not exists projects_site_idx on public.website_projects(website_id, display_order);
create index if not exists testimonials_site_idx on public.website_testimonials(website_id, display_order);
create index if not exists faqs_site_idx on public.website_faqs(website_id, display_order);
create index if not exists leads_site_idx on public.website_leads(website_id, created_at desc);

-- ---------------------------------------------------- Row Level Security
-- The app talks to Supabase through server routes using the service-role key (bypasses RLS).
-- These policies protect the data if the anon key is ever used directly:
--   * anonymous visitors can read PUBLISHED sites only
--   * signed-in users (future auth) can manage only rows they own
--   * leads are never readable/writable by anon: they are inserted by /api/leads (rate-limited)
alter table public.websites enable row level security;
alter table public.website_navigation enable row level security;
alter table public.website_sections enable row level security;
alter table public.website_services enable row level security;
alter table public.website_projects enable row level security;
alter table public.website_testimonials enable row level security;
alter table public.website_faqs enable row level security;
alter table public.website_leads enable row level security;

drop policy if exists websites_public_read on public.websites;
create policy websites_public_read on public.websites for select using (status = 'published');
drop policy if exists websites_owner_all on public.websites;
create policy websites_owner_all on public.websites for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['website_navigation','website_sections','website_services','website_projects','website_testimonials','website_faqs'] loop
    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('create policy %I on public.%I for select using (exists (select 1 from public.websites w where w.id = website_id and w.status = ''published''))', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_owner_all', t);
    execute format('create policy %I on public.%I for all to authenticated using (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = auth.uid())) with check (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = auth.uid()))', t || '_owner_all', t);
  end loop;
end $$;

drop policy if exists website_leads_owner_read on public.website_leads;
create policy website_leads_owner_read on public.website_leads for select to authenticated
  using (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = auth.uid()));

-- ------------------------------------------------------------ Storage
-- Public-read bucket (generated sites need to show images). Writes happen only through the
-- server upload route (service role) which validates type, size and file signature.
-- There is deliberately no INSERT/UPDATE/DELETE policy on storage.objects for anon/authenticated.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('website-assets', 'website-assets', true, 5242880,
        array['image/png','image/jpeg','image/webp','image/gif','image/x-icon','image/vnd.microsoft.icon'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------- Atomic save (one transaction)
create or replace function public.save_website(p jsonb) returns jsonb
language plpgsql security invoker as $$
declare
  w jsonb := p->'website';
  wid uuid := (w->>'id')::uuid;
  owner uuid := nullif(w->>'owner_id','')::uuid;
  existing record;
begin
  select id, owner_id, status into existing from public.websites where id = wid for update;
  if found and existing.owner_id is distinct from owner then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  insert into public.websites (id, owner_id, name, slug, status, business_details, theme_config, layout_config, seo_config, section_order, published_at)
  values (wid, owner, w->>'name', w->>'slug', w->>'status', w->'business_details', w->'theme_config', w->'layout_config', w->'seo_config', w->'section_order',
          case when w->>'status' = 'published' then now() end)
  on conflict (id) do update set
    name = excluded.name, slug = excluded.slug, status = excluded.status, business_details = excluded.business_details,
    theme_config = excluded.theme_config, layout_config = excluded.layout_config, seo_config = excluded.seo_config,
    section_order = excluded.section_order,
    published_at = case when excluded.status = 'published' then coalesce(public.websites.published_at, now()) else null end;

  delete from public.website_navigation where website_id = wid;
  delete from public.website_sections where website_id = wid;
  delete from public.website_services where website_id = wid;
  delete from public.website_projects where website_id = wid;
  delete from public.website_testimonials where website_id = wid;
  delete from public.website_faqs where website_id = wid;

  insert into public.website_navigation (id, website_id, label, destination, link_type, is_visible, display_order)
  select r.id, wid, r.label, r.destination, r.link_type, r.is_visible, r.display_order
  from jsonb_to_recordset(p->'navigation') as r(id uuid, label text, destination text, link_type text, is_visible boolean, display_order int);

  insert into public.website_sections (website_id, section_type, title, content, is_enabled, display_order)
  select wid, r.section_type, r.title, r.content, r.is_enabled, r.display_order
  from jsonb_to_recordset(p->'sections') as r(section_type text, title text, content jsonb, is_enabled boolean, display_order int);

  insert into public.website_services (id, website_id, name, description, details, image_path, image_alt, icon, price_label, cta_label, cta_url, is_visible, display_order)
  select r.id, wid, r.name, r.description, r.details, r.image_path, r.image_alt, r.icon, r.price_label, r.cta_label, r.cta_url, r.is_visible, r.display_order
  from jsonb_to_recordset(p->'services') as r(id uuid, name text, description text, details text, image_path text, image_alt text, icon text, price_label text, cta_label text, cta_url text, is_visible boolean, display_order int);

  insert into public.website_projects (id, website_id, name, description, location, category, image_paths, metadata, is_visible, display_order)
  select r.id, wid, r.name, r.description, r.location, r.category, r.image_paths, r.metadata, r.is_visible, r.display_order
  from jsonb_to_recordset(p->'projects') as r(id uuid, name text, description text, location text, category text, image_paths jsonb, metadata jsonb, is_visible boolean, display_order int);

  insert into public.website_testimonials (id, website_id, customer_name, testimonial, photo_path, photo_alt, company, location, rating, source_url, is_visible, display_order)
  select r.id, wid, r.customer_name, r.testimonial, r.photo_path, r.photo_alt, r.company, r.location, r.rating, r.source_url, r.is_visible, r.display_order
  from jsonb_to_recordset(p->'testimonials') as r(id uuid, customer_name text, testimonial text, photo_path text, photo_alt text, company text, location text, rating int, source_url text, is_visible boolean, display_order int);

  insert into public.website_faqs (id, website_id, question, answer, is_visible, display_order)
  select r.id, wid, r.question, r.answer, r.is_visible, r.display_order
  from jsonb_to_recordset(p->'faqs') as r(id uuid, question text, answer text, is_visible boolean, display_order int);

  return jsonb_build_object('id', wid);
end $$;

revoke all on function public.save_website(jsonb) from public, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on table
  public.websites,
  public.website_navigation,
  public.website_sections,
  public.website_services,
  public.website_projects,
  public.website_testimonials,
  public.website_faqs,
  public.website_leads
to service_role;
grant execute on function public.save_website(jsonb) to service_role;
