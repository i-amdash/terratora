alter table public.posts add column if not exists author_name text;
alter table public.posts add column if not exists author_avatar_url text;

update public.posts
set author_name = 'Terratora Editorial Team'
where author_name is null or btrim(author_name) = '';

alter table public.posts alter column author_name set default 'Terratora Editorial Team';
alter table public.posts alter column author_name set not null;
