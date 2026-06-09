create table public.guide_purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  guide_slug text not null,
  stripe_session_id text,
  purchased_at timestamptz default now()
);

alter table public.guide_purchases enable row level security;

create policy "Clients read own purchases" on public.guide_purchases
  for select using (auth.uid() = user_id);

create unique index guide_purchases_unique on public.guide_purchases(user_id, guide_slug);