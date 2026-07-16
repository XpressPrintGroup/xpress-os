create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now()
);

alter table suppliers enable row level security;

create policy "Authenticated users can read suppliers" on suppliers
  for select to authenticated using (true);
create policy "Authenticated users can write suppliers" on suppliers
  for all to authenticated using (true) with check (true);
