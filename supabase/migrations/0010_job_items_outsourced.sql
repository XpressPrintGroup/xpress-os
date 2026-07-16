alter table job_items add column is_outsourced boolean not null default false;
alter table job_items add column supplier text;
