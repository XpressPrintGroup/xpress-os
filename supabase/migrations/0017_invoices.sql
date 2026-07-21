create table invoices (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  customer_id uuid references customers(id) on delete restrict,
  invoice_number text not null unique,
  status text not null default 'Draft', -- Draft | Sent | Paid
  total numeric(10, 2) not null default 0,
  notes text,
  created_at timestamptz default now()
);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric(10, 2) not null default 0,
  created_at timestamptz default now()
);

alter table invoices enable row level security;
alter table invoice_items enable row level security;

create policy "Authenticated users can read invoices" on invoices
  for select to authenticated using (true);
create policy "Authenticated users can write invoices" on invoices
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read invoice_items" on invoice_items
  for select to authenticated using (true);
create policy "Authenticated users can write invoice_items" on invoice_items
  for all to authenticated using (true) with check (true);
