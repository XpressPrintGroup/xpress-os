alter table jobs add column quote_id uuid references quotes(id) on delete set null;
