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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists image_url text;

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
