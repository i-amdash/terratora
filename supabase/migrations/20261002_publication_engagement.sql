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
