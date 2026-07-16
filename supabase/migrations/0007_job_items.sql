create table job_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  created_at timestamptz default now()
);

alter table job_items enable row level security;

create policy "Authenticated users can read job_items" on job_items
  for select to authenticated using (true);
create policy "Authenticated users can write job_items" on job_items
  for all to authenticated using (true) with check (true);

alter table jobs drop column if exists product_type;
alter table jobs drop column if exists quantity;
