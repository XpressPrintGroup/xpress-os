alter table jobs add column assigned_to_user_id uuid references users(id) on delete set null;
alter table jobs drop column if exists assigned_to;
