alter table public.posts
  add column if not exists comments_require_approval boolean not null default false;

alter table public.publication_comments
  add column if not exists is_team boolean not null default false;

alter table public.publication_comments drop constraint if exists publication_comments_status_check;
alter table public.publication_comments
  add constraint publication_comments_status_check
  check (status in ('pending', 'published', 'hidden'));

alter table public.messages drop constraint if exists messages_status_check;
alter table public.messages
  add constraint messages_status_check
  check (status in ('new', 'in_progress', 'completed'));

alter table public.bookings add column if not exists scheduled_at timestamptz;
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check
  check (status in ('pending', 'scheduled', 'completed', 'cancelled'));

create index if not exists publication_comments_status_created_idx
  on public.publication_comments (status, created_at desc);

create index if not exists messages_status_created_idx
  on public.messages (status, created_at desc);

create index if not exists bookings_status_scheduled_idx
  on public.bookings (status, scheduled_at);
