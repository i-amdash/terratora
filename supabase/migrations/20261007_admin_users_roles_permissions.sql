alter table public.admin_users add column if not exists full_name text;
alter table public.admin_users add column if not exists role text not null default 'editor';
alter table public.admin_users add column if not exists permissions text[] not null default '{}';
alter table public.admin_users add column if not exists is_active boolean not null default true;
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();

alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users
  add constraint admin_users_role_check check (role in ('owner', 'admin', 'editor', 'viewer'));

-- Existing administrators become owners so applying this migration cannot lock anyone out.
update public.admin_users
set role = 'owner',
    permissions = array['manage_content', 'manage_publications', 'view_messages', 'view_bookings', 'manage_users'],
    is_active = true,
    updated_at = now()
where role = 'editor' and cardinality(permissions) = 0;
