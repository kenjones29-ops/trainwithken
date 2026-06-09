-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  role text default 'client' check (role in ('client', 'admin')),
  stripe_customer_id text,
  plan text check (plan in ('self-led', 'online', 'vip')),
  plan_status text default 'inactive' check (plan_status in ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  start_date date,
  created_at timestamptz default now()
);

-- Subscriptions (Stripe data)
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  plan text,
  status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- Weekly check-ins
create table public.check_ins (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete cascade,
  week_number int not null,
  weight_lbs numeric,
  body_fat_pct numeric,
  energy_level int check (energy_level between 1 and 10),
  sleep_quality int check (sleep_quality between 1 and 10),
  workout_compliance int check (workout_compliance between 0 and 100),
  nutrition_compliance int check (nutrition_compliance between 0 and 100),
  notes text,
  coach_notes text,
  submitted_at timestamptz default now()
);

-- Nutrition targets (set by KJ)
create table public.macros (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete cascade,
  calories int,
  protein_oz numeric,
  carbs_oz numeric,
  fat_oz numeric,
  notes text,
  set_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Training programs
create table public.programs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  weeks int default 12,
  status text default 'active' check (status in ('active', 'completed', 'paused')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Individual workouts inside a program
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references public.programs(id) on delete cascade,
  week_number int not null,
  day_number int not null,
  name text not null,
  notes text,
  created_at timestamptz default now()
);

-- Exercises inside a workout
create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts(id) on delete cascade,
  name text not null,
  sets int,
  reps text,
  rest_seconds int,
  notes text,
  order_index int default 0
);

-- ── RLS Policies ────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.check_ins enable row level security;
alter table public.macros enable row level security;
alter table public.programs enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;

-- Clients see only their own data
create policy "Clients read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Clients update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Clients read own check-ins" on public.check_ins for select using (auth.uid() = client_id);
create policy "Clients insert own check-ins" on public.check_ins for insert with check (auth.uid() = client_id);

create policy "Clients read own macros" on public.macros for select using (auth.uid() = client_id);
create policy "Clients read own programs" on public.programs for select using (auth.uid() = client_id);
create policy "Clients read own workouts" on public.workouts for select using (
  exists (select 1 from public.programs p where p.id = program_id and p.client_id = auth.uid())
);
create policy "Clients read own exercises" on public.exercises for select using (
  exists (
    select 1 from public.workouts w
    join public.programs p on p.id = w.program_id
    where w.id = workout_id and p.client_id = auth.uid()
  )
);

-- Admins have full access (service role bypasses RLS automatically)
-- Service role key used in all admin API routes

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();