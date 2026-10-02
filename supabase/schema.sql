-- Run this entire file in the Supabase SQL editor.
create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  body text not null,
  category text not null default 'Perspective',
  featured boolean not null default false,
  published boolean not null default false,
  published_at date not null default current_date,
  image_url text,
  author_name text not null default 'Terratora Editorial Team',
  author_avatar_url text,
  read_count bigint not null default 0,
  share_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists image_url text;
alter table public.posts add column if not exists author_name text;
alter table public.posts add column if not exists author_avatar_url text;
update public.posts set author_name = 'Terratora Editorial Team' where author_name is null or btrim(author_name) = '';
alter table public.posts alter column author_name set default 'Terratora Editorial Team';
alter table public.posts alter column author_name set not null;
alter table public.posts add column if not exists read_count bigint not null default 0;
alter table public.posts add column if not exists share_count bigint not null default 0;

create or replace function public.increment_post_read(post_slug text)
returns table(read_count bigint, share_count bigint)
language sql
security definer
set search_path = public
as $$
  update public.posts
  set read_count = posts.read_count + 1
  where slug = post_slug and published = true
  returning posts.read_count, posts.share_count;
$$;

create or replace function public.increment_post_share(post_slug text)
returns table(read_count bigint, share_count bigint)
language sql
security definer
set search_path = public
as $$
  update public.posts
  set share_count = posts.share_count + 1
  where slug = post_slug and published = true
  returning posts.read_count, posts.share_count;
$$;

revoke all on function public.increment_post_read(text) from public, anon, authenticated;
revoke all on function public.increment_post_share(text) from public, anon, authenticated;
grant execute on function public.increment_post_read(text) to service_role;
grant execute on function public.increment_post_share(text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 8388608, allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  organisation text,
  interest text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  organisation text,
  preferred_date date not null,
  preferred_time time not null,
  timezone text not null default 'Africa/Lagos',
  session_type text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Keep existing projects compatible when this file is run again.
alter table public.bookings add column if not exists timezone text;
update public.bookings set timezone = 'Africa/Lagos' where timezone is null;
alter table public.bookings alter column timezone set default 'Africa/Lagos';
alter table public.bookings alter column timezone set not null;

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;
alter table public.posts enable row level security;
alter table public.messages enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Public can read content" on public.site_content;
create policy "Public can read content" on public.site_content for select using (true);
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts" on public.posts for select using (published = true);
drop policy if exists "Users can verify their own admin status" on public.admin_users;
create policy "Users can verify their own admin status" on public.admin_users for select using (auth.uid() = user_id);

-- After creating an Auth user, promote it with:
-- insert into public.admin_users (user_id) select id from auth.users where email = 'you@example.com';
