-- ImageLink: projects, images, tags (per project), and image-tag assignments.
-- Owner-only access via RLS; cross-project tag assignment blocked by trigger.
-- Domain objects live in schema "imageLINK" (not public).

create schema if not exists "imageLINK";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table "imageLINK".projects (
  id uuid primary key default gen_random_uuid (),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now ()
);

create index idx_projects_owner_id on "imageLINK".projects (owner_id);

create table "imageLINK".images (
  id uuid primary key default gen_random_uuid (),
  project_id uuid not null references "imageLINK".projects (id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  status text not null default 'uploaded'
    check (status in ('uploaded', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now ()
);

create index idx_images_project_id on "imageLINK".images (project_id);

create table "imageLINK".tags (
  id uuid primary key default gen_random_uuid (),
  project_id uuid not null references "imageLINK".projects (id) on delete cascade,
  name text not null,
  normalized_name text not null,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now (),
  unique (project_id, normalized_name)
);

create index idx_tags_project_id on "imageLINK".tags (project_id);

create table "imageLINK".image_tags (
  id uuid primary key default gen_random_uuid (),
  image_id uuid not null references "imageLINK".images (id) on delete cascade,
  tag_id uuid not null references "imageLINK".tags (id) on delete cascade,
  assigned_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now (),
  unique (image_id, tag_id)
);

create index idx_image_tags_image_id on "imageLINK".image_tags (image_id);
create index idx_image_tags_tag_id on "imageLINK".image_tags (tag_id);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function "imageLINK".set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_projects_updated_at
before update on "imageLINK".projects
for each row
execute function "imageLINK".set_updated_at ();

create trigger trg_images_updated_at
before update on "imageLINK".images
for each row
execute function "imageLINK".set_updated_at ();

create trigger trg_tags_updated_at
before update on "imageLINK".tags
for each row
execute function "imageLINK".set_updated_at ();

-- ---------------------------------------------------------------------------
-- Tag name normalization (dedupe by project via unique on normalized_name)
-- ---------------------------------------------------------------------------

create or replace function "imageLINK".tags_set_normalized_name ()
returns trigger
language plpgsql
as $$
begin
  new.normalized_name = lower(trim(new.name));
  if new.normalized_name = '' then
    raise exception 'Tag name cannot be empty';
  end if;
  return new;
end;
$$;

create trigger trg_tags_normalized_name
before insert or update of name on "imageLINK".tags
for each row
execute function "imageLINK".tags_set_normalized_name ();

-- ---------------------------------------------------------------------------
-- Ensure image_tags only links rows from the same project
-- ---------------------------------------------------------------------------

create or replace function "imageLINK".validate_image_tags_same_project ()
returns trigger
language plpgsql
as $$
declare
  img_project uuid;
  tag_project uuid;
begin
  select i.project_id into img_project
  from "imageLINK".images i
  where i.id = new.image_id;

  select t.project_id into tag_project
  from "imageLINK".tags t
  where t.id = new.tag_id;

  if img_project is null or tag_project is null then
    raise exception 'Invalid image_id or tag_id';
  end if;

  if img_project <> tag_project then
    raise exception 'Image and tag must belong to the same project';
  end if;

  return new;
end;
$$;

create trigger trg_image_tags_same_project
before insert or update of image_id, tag_id on "imageLINK".image_tags
for each row
execute function "imageLINK".validate_image_tags_same_project ();

-- ---------------------------------------------------------------------------
-- Row Level Security (owner of project only)
-- ---------------------------------------------------------------------------

alter table "imageLINK".projects enable row level security;
alter table "imageLINK".images enable row level security;
alter table "imageLINK".tags enable row level security;
alter table "imageLINK".image_tags enable row level security;

create policy "projects_select_own"
on "imageLINK".projects
for select
using (auth.uid () = owner_id);

create policy "projects_insert_own"
on "imageLINK".projects
for insert
with check (auth.uid () = owner_id);

create policy "projects_update_own"
on "imageLINK".projects
for update
using (auth.uid () = owner_id)
with check (auth.uid () = owner_id);

create policy "projects_delete_own"
on "imageLINK".projects
for delete
using (auth.uid () = owner_id);

create policy "images_all_own_project"
on "imageLINK".images
for all
using (
  exists (
    select 1
    from "imageLINK".projects p
    where p.id = images.project_id
      and p.owner_id = auth.uid ()
  )
)
with check (
  exists (
    select 1
    from "imageLINK".projects p
    where p.id = images.project_id
      and p.owner_id = auth.uid ()
  )
);

create policy "tags_all_own_project"
on "imageLINK".tags
for all
using (
  exists (
    select 1
    from "imageLINK".projects p
    where p.id = tags.project_id
      and p.owner_id = auth.uid ()
  )
)
with check (
  exists (
    select 1
    from "imageLINK".projects p
    where p.id = tags.project_id
      and p.owner_id = auth.uid ()
  )
);

create policy "image_tags_all_own"
on "imageLINK".image_tags
for all
using (
  exists (
    select 1
    from "imageLINK".images i
    join "imageLINK".projects p on p.id = i.project_id
    where i.id = image_tags.image_id
      and p.owner_id = auth.uid ()
  )
)
with check (
  exists (
    select 1
    from "imageLINK".images i
    join "imageLINK".projects p on p.id = i.project_id
    where i.id = image_tags.image_id
      and p.owner_id = auth.uid ()
  )
  and exists (
    select 1
    from "imageLINK".tags t
    join "imageLINK".projects p on p.id = t.project_id
    where t.id = image_tags.tag_id
      and p.owner_id = auth.uid ()
  )
);

-- ---------------------------------------------------------------------------
-- Grants for Supabase API roles (PostgREST / JWT)
-- ---------------------------------------------------------------------------

grant usage on schema "imageLINK" to postgres, anon, authenticated, service_role;

grant all on all tables in schema "imageLINK" to postgres, service_role;
grant all on all sequences in schema "imageLINK" to postgres, service_role;
grant execute on all functions in schema "imageLINK" to postgres, service_role;

grant select, insert, update, delete on all tables in schema "imageLINK" to anon, authenticated;

alter default privileges in schema "imageLINK"
grant all on tables to postgres, service_role;
alter default privileges in schema "imageLINK"
grant select, insert, update, delete on tables to anon, authenticated;
