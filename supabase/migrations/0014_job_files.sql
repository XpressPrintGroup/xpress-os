insert into storage.buckets (id, name, public)
values ('job-files', 'job-files', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload job files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'job-files');

create policy "Authenticated users can read job files"
on storage.objects for select
to authenticated
using (bucket_id = 'job-files');

create policy "Authenticated users can delete job files"
on storage.objects for delete
to authenticated
using (bucket_id = 'job-files');

create table job_files (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  uploaded_by text,
  created_at timestamptz default now()
);

alter table job_files enable row level security;

create policy "Authenticated users can read job_files" on job_files
  for select to authenticated using (true);
create policy "Authenticated users can write job_files" on job_files
  for all to authenticated using (true) with check (true);
