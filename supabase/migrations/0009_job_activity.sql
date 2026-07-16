create table job_activity (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  text text not null,
  logged_by text,
  created_at timestamptz default now()
);

alter table job_activity enable row level security;

create policy "Authenticated users can read job_activity" on job_activity
  for select to authenticated using (true);
create policy "Authenticated users can write job_activity" on job_activity
  for all to authenticated using (true) with check (true);
