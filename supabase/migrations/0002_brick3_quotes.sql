create table quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete restrict,
  status text not null default 'Draft', -- Draft | Sent | Accepted | Declined
  total numeric(10, 2) not null default 0,
  notes text,
  created_at timestamptz default now()
);

create table quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references quotes(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric(10, 2) not null default 0,
  created_at timestamptz default now()
);

alter table quotes enable row level security;
alter table quote_items enable row level security;

create policy "Authenticated users can read quotes" on quotes
  for select to authenticated using (true);
create policy "Authenticated users can write quotes" on quotes
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read quote_items" on quote_items
  for select to authenticated using (true);
create policy "Authenticated users can write quote_items" on quote_items
  for all to authenticated using (true) with check (true);
