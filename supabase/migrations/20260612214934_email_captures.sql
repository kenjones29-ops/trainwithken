create table public.email_captures (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  source text not null,
  first_name text,
  created_at timestamptz default now()
);

create index email_captures_email_idx on public.email_captures(email);

alter table public.email_captures enable row level security;

create policy "Allow anonymous inserts" on public.email_captures
  for insert to anon with check (true);