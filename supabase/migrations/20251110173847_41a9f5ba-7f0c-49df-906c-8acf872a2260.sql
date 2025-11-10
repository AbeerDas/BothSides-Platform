-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text unique,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create debates table
create table public.debates (
  id uuid not null default gen_random_uuid() primary key,
  slug text unique not null,
  statement text not null,
  summary text not null,
  arguments_data jsonb not null,
  user_id uuid references auth.users on delete set null,
  is_public boolean not null default true,
  created_at timestamp with time zone not null default now()
);

alter table public.debates enable row level security;

-- Debates policies
create policy "Public debates are viewable by everyone"
  on public.debates for select
  using (is_public = true);

create policy "Users can view their own debates"
  on public.debates for select
  using (auth.uid() = user_id);

create policy "Anyone can insert debates"
  on public.debates for insert
  with check (true);

create policy "Users can update their own debates"
  on public.debates for update
  using (auth.uid() = user_id);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create index for faster slug lookups
create index debates_slug_idx on public.debates(slug);
create index debates_user_id_idx on public.debates(user_id);
create index debates_created_at_idx on public.debates(created_at desc);