-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table (profiles extending auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('employee', 'approver', 'admin')),
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Create flights table (mock flight data)
create table if not exists public.flights (
  id uuid primary key default uuid_generate_v4(),
  airline text not null,
  flight_number text not null,
  origin text not null,
  destination text not null,
  departure_time timestamptz not null,
  arrival_time timestamptz not null,
  price decimal(10, 2) not null,
  seats_available integer not null,
  created_at timestamptz default now()
);

-- Enable RLS on flights (public read access)
alter table public.flights enable row level security;

create policy "flights_select_all"
  on public.flights for select
  to authenticated
  using (true);

-- Create flight_requests table
create table if not exists public.flight_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  flight_id uuid not null references public.flights(id) on delete cascade,
  origin text not null,
  destination text not null,
  departure_date date not null,
  return_date date,
  trip_type text not null check (trip_type in ('one-way', 'round-trip')),
  passengers integer not null default 1,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  total_price decimal(10, 2) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on flight_requests
alter table public.flight_requests enable row level security;

-- Users can view their own requests
create policy "requests_select_own"
  on public.flight_requests for select
  using (auth.uid() = user_id);

-- Approvers can view all requests
create policy "requests_select_approvers"
  on public.flight_requests for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('approver', 'admin')
    )
  );

-- Users can create their own requests
create policy "requests_insert_own"
  on public.flight_requests for insert
  with check (auth.uid() = user_id);

-- Users can update their own pending requests
create policy "requests_update_own"
  on public.flight_requests for update
  using (auth.uid() = user_id and status = 'pending');

-- Create approvals table
create table if not exists public.approvals (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references public.flight_requests(id) on delete cascade,
  approver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('approved', 'rejected')),
  comments text,
  created_at timestamptz default now()
);

-- Enable RLS on approvals
alter table public.approvals enable row level security;

-- Users can view approvals for their requests
create policy "approvals_select_own_requests"
  on public.approvals for select
  using (
    exists (
      select 1 from public.flight_requests
      where flight_requests.id = request_id
      and flight_requests.user_id = auth.uid()
    )
  );

-- Approvers can view all approvals
create policy "approvals_select_approvers"
  on public.approvals for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('approver', 'admin')
    )
  );

-- Approvers can create approvals
create policy "approvals_insert_approvers"
  on public.approvals for insert
  with check (
    auth.uid() = approver_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('approver', 'admin')
    )
  );

-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('request_created', 'request_approved', 'request_rejected')),
  read boolean default false,
  related_request_id uuid references public.flight_requests(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS on notifications
alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_insert_system"
  on public.notifications for insert
  with check (true);

-- Function to auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

create trigger update_flight_requests_updated_at
  before update on public.flight_requests
  for each row
  execute function update_updated_at_column();

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, department)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    coalesce(new.raw_user_meta_data ->> 'role', 'employee'),
    coalesce(new.raw_user_meta_data ->> 'department', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger for auto-creating profile on user signup
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to create notification on approval/rejection
create or replace function public.notify_on_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  request_user_id uuid;
  approver_name text;
begin
  -- Get the user_id from the request
  select user_id into request_user_id
  from public.flight_requests
  where id = new.request_id;

  -- Get approver name
  select full_name into approver_name
  from public.profiles
  where id = new.approver_id;

  -- Create notification
  insert into public.notifications (user_id, title, message, type, related_request_id)
  values (
    request_user_id,
    case
      when new.status = 'approved' then 'Request Approved'
      else 'Request Rejected'
    end,
    case
      when new.status = 'approved' then 'Your flight request has been approved by ' || approver_name
      else 'Your flight request has been rejected by ' || approver_name
    end,
    case
      when new.status = 'approved' then 'request_approved'
      else 'request_rejected'
    end,
    new.request_id
  );

  -- Update request status
  update public.flight_requests
  set status = new.status
  where id = new.request_id;

  return new;
end;
$$;

-- Trigger for creating notifications
drop trigger if exists on_approval_created on public.approvals;

create trigger on_approval_created
  after insert on public.approvals
  for each row
  execute function public.notify_on_approval();
