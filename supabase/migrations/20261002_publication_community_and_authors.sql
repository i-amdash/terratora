create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  role text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists author_id uuid references public.authors(id) on delete set null;
alter table public.posts add column if not exists like_count bigint not null default 0;

insert into public.authors (name, avatar_url)
select author_name, max(author_avatar_url)
from public.posts
where author_name is not null and btrim(author_name) <> ''
group by author_name
on conflict (name) do update
set avatar_url = coalesce(public.authors.avatar_url, excluded.avatar_url);

update public.posts as post
set author_id = author.id
from public.authors as author
where post.author_id is null and post.author_name = author.name;

create table if not exists public.publication_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  visitor_key text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, visitor_key)
);

create table if not exists public.publication_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  parent_id uuid references public.publication_comments(id) on delete cascade,
  author_name text not null,
  author_email text not null,
  body text not null,
  like_count bigint not null default 0,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.publication_comment_likes (
  comment_id uuid not null references public.publication_comments(id) on delete cascade,
  visitor_key text not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, visitor_key)
);

alter table public.authors enable row level security;
alter table public.publication_likes enable row level security;
alter table public.publication_comments enable row level security;
alter table public.publication_comment_likes enable row level security;

create or replace function public.toggle_post_like(post_slug text, visitor_token text)
returns table(like_count bigint, liked boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
  next_liked boolean;
begin
  select post.id into target_id
  from public.posts as post
  where post.slug = post_slug and post.published = true
  for update;

  if target_id is null then return; end if;

  if exists (select 1 from public.publication_likes where post_id = target_id and visitor_key = visitor_token) then
    delete from public.publication_likes where post_id = target_id and visitor_key = visitor_token;
    next_liked := false;
  else
    insert into public.publication_likes (post_id, visitor_key) values (target_id, visitor_token);
    next_liked := true;
  end if;

  update public.posts as post
  set like_count = (select count(*) from public.publication_likes where post_id = target_id)
  where post.id = target_id;

  return query select post.like_count, next_liked from public.posts as post where post.id = target_id;
end;
$$;

create or replace function public.toggle_comment_like(target_comment_id uuid, visitor_token text)
returns table(like_count bigint, liked boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  next_liked boolean;
begin
  perform 1 from public.publication_comments where id = target_comment_id and status = 'published' for update;
  if not found then return; end if;

  if exists (select 1 from public.publication_comment_likes where comment_id = target_comment_id and visitor_key = visitor_token) then
    delete from public.publication_comment_likes where comment_id = target_comment_id and visitor_key = visitor_token;
    next_liked := false;
  else
    insert into public.publication_comment_likes (comment_id, visitor_key) values (target_comment_id, visitor_token);
    next_liked := true;
  end if;

  update public.publication_comments as comment
  set like_count = (select count(*) from public.publication_comment_likes where comment_id = target_comment_id)
  where comment.id = target_comment_id;

  return query select comment.like_count, next_liked from public.publication_comments as comment where comment.id = target_comment_id;
end;
$$;

revoke all on function public.toggle_post_like(text, text) from public, anon, authenticated;
revoke all on function public.toggle_comment_like(uuid, text) from public, anon, authenticated;
grant execute on function public.toggle_post_like(text, text) to service_role;
grant execute on function public.toggle_comment_like(uuid, text) to service_role;
