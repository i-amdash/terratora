create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  email text not null unique check (email = lower(email)),
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  consent_at timestamptz not null default now(),
  consent_source text not null default 'website',
  subscribed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (char_length(subject) between 1 and 200),
  body text not null,
  status text not null default 'sending' check (status in ('sending', 'sent', 'failed')),
  recipient_count integer not null default 0,
  last_error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists subscribers_subscribed_at_idx on public.subscribers (subscribed_at desc);
create index if not exists newsletters_created_at_idx on public.newsletters (created_at desc);

alter table public.subscribers enable row level security;
alter table public.newsletters enable row level security;

revoke all on table public.subscribers from public, anon, authenticated;
revoke all on table public.newsletters from public, anon, authenticated;
grant all on table public.subscribers to service_role;
grant all on table public.newsletters to service_role;

-- Existing owners and administrators receive the new capability automatically.
update public.admin_users
set permissions = array_append(permissions, 'manage_newsletters'),
    updated_at = now()
where role in ('owner', 'admin')
  and not ('manage_newsletters' = any(permissions));
