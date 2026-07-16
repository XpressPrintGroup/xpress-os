create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz default now()
);

create table customer_activity (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  text text not null,
  logged_by text,
  created_at timestamptz default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text unique not null,
  customer_id uuid references customers(id) on delete restrict,
  product_type text,
  status text not null default 'New Enquiry',
  assigned_to text,
  due_date date,
  priority text default 'Normal',
  notes text,
  created_at timestamptz default now()
);

create table users (
  id uuid primary key references auth.users(id),
  name text,
  role text not null default 'sales' -- admin | sales | designer | production | accounts
);

alter table customers enable row level security;
alter table customer_activity enable row level security;
alter table jobs enable row level security;
alter table users enable row level security;

create policy "Authenticated users can read customers" on customers
  for select to authenticated using (true);
create policy "Authenticated users can write customers" on customers
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read customer_activity" on customer_activity
  for select to authenticated using (true);
create policy "Authenticated users can write customer_activity" on customer_activity
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read jobs" on jobs
  for select to authenticated using (true);
create policy "Authenticated users can write jobs" on jobs
  for all to authenticated using (true) with check (true);

create policy "Users can read own row" on users
  for select to authenticated using (true);
