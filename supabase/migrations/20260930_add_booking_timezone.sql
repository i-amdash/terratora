alter table public.bookings add column if not exists timezone text;
update public.bookings set timezone = 'Africa/Lagos' where timezone is null;
alter table public.bookings alter column timezone set default 'Africa/Lagos';
alter table public.bookings alter column timezone set not null;
