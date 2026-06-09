create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  service text not null,
  preferred_date date,
  preferred_time text,
  goal text,
  source text
);

alter table public.bookings enable row level security;

create policy "Allow anonymous inserts" on public.bookings
  for insert to anon with check (true);