create table campaigns (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz default now()
);

alter table campaigns enable row level security;

create policy "Authenticated users can read campaigns" on campaigns
  for select to authenticated using (true);
create policy "Authenticated users can write campaigns" on campaigns
  for all to authenticated using (true) with check (true);

alter table jobs add column campaign_id uuid references campaigns(id) on delete set null;
