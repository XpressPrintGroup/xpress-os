create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  default_unit_price numeric(10, 2) not null default 0,
  created_at timestamptz default now()
);

alter table products enable row level security;

create policy "Authenticated users can read products" on products
  for select to authenticated using (true);
create policy "Authenticated users can write products" on products
  for all to authenticated using (true) with check (true);
