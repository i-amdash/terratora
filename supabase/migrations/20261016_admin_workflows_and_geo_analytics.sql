alter table public.newsletters drop constraint if exists newsletters_status_check;
alter table public.newsletters
  add constraint newsletters_status_check
  check (status in ('draft', 'sending', 'scheduled', 'sent', 'failed', 'canceled'));
alter table public.newsletters alter column status set default 'draft';
alter table public.newsletters add column if not exists scheduled_for timestamptz;
alter table public.newsletters add column if not exists resend_broadcast_id text;

create table if not exists public.newsletter_settings (
  id text primary key,
  resend_segment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_page_views add column if not exists country_code text;
alter table public.site_page_views add column if not exists region text;
alter table public.site_page_views add column if not exists city text;

create index if not exists site_page_views_location_idx
  on public.site_page_views (country_code, city);

alter table public.newsletter_settings enable row level security;
revoke all on table public.newsletter_settings from public, anon, authenticated;
grant all on table public.newsletter_settings to service_role;

create or replace function public.get_site_analytics()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total_visits', (select count(distinct session_id) from public.site_page_views),
    'total_page_views', (select count(*) from public.site_page_views),
    'unique_visitors', (select count(distinct visitor_id) from public.site_page_views),
    'views_this_month', (
      select count(*) from public.site_page_views
      where viewed_at >= date_trunc('month', now())
    ),
    'months', coalesce((
      select jsonb_agg(jsonb_build_object(
        'month', to_char(month_start, 'YYYY-MM'),
        'page_views', page_views,
        'visits', visits
      ) order by month_start)
      from (
        select month_start, count(page_view.id) as page_views,
          count(distinct page_view.session_id) as visits
        from generate_series(
          date_trunc('month', now()) - interval '5 months',
          date_trunc('month', now()), interval '1 month'
        ) as month_start
        left join public.site_page_views as page_view
          on page_view.viewed_at >= month_start
          and page_view.viewed_at < month_start + interval '1 month'
        group by month_start
      ) as monthly_totals
    ), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(to_jsonb(page_totals) order by page_views desc, path)
      from (
        select path, count(*) as page_views,
          count(distinct session_id) as visits
        from public.site_page_views
        group by path
        order by page_views desc, path
        limit 10
      ) as page_totals
    ), '[]'::jsonb),
    'top_locations', coalesce((
      select jsonb_agg(to_jsonb(location_totals) order by page_views desc, country_code, city)
      from (
        select coalesce(nullif(country_code, ''), 'Unknown') as country_code,
          coalesce(nullif(city, ''), 'Unknown') as city,
          count(*) as page_views,
          count(distinct session_id) as visits
        from public.site_page_views
        group by coalesce(nullif(country_code, ''), 'Unknown'), coalesce(nullif(city, ''), 'Unknown')
        order by page_views desc
        limit 10
      ) as location_totals
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.get_site_analytics() from public, anon, authenticated;
grant execute on function public.get_site_analytics() to service_role;
