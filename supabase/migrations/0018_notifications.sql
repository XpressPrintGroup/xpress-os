create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "Users can read own notifications" on notifications
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Authenticated users can create notifications" on notifications
  for insert to authenticated with check (true);
