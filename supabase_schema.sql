-- Create a table for ideas
create table public.ideas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  status text not null default 'new',
  vote_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  space_slug text not null
);

-- Create a table for comments
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.ideas enable row level security;
alter table public.comments enable row level security;

-- Create policies (modify for production to restrict access)
create policy "Allow public read access to ideas"
  on public.ideas for select
  to anon
  using (true);

create policy "Allow public insert to ideas"
  on public.ideas for insert
  to anon
  with check (true);

create policy "Allow public update to vote_count"
  on public.ideas for update
  to anon
  using (true);
  
create policy "Allow public read access to comments"
  on public.comments for select
  to anon
  using (true);

create policy "Allow public insert to comments"
  on public.comments for insert
  to anon
  with check (true);
