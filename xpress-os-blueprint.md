# Xpress OS — Blueprint v1

A print-shop operations system for Xpress Print, built brick by brick.
This document is the spec to hand to Claude Code to start the real, deployed build.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Storage)
- Vercel (hosting)

## Principles
- Ship a working brick every session. No feature gets built until the previous one is deployed and usable.
- One customer record, ever — no duplicates.
- Every job belongs to one customer. Every file belongs to one job.
- If a screen needs more than 3 clicks for a daily task, redesign it.
- Real auth from day one (Supabase Auth) — no placeholder logins.

## Brick 1 — Foundation (build this first)
- Supabase project connected, schema below created via migration
- Login (email/password via Supabase Auth)
- App shell: sidebar nav, topbar, dashboard placeholder
- Customers module: list, search, add, edit, delete, notes timeline
- Deployed to Vercel with a working URL

## Brick 2 — Jobs
- Jobs table linked to customers
- Job statuses: New Enquiry → Quote → Awaiting Deposit → Artwork → Proof Sent →
  Approved → Printing → Finishing → Ready → Collected → Completed
- Assign a staff member, due date, priority
- Job list + job detail page; jobs also show on the customer record

## Brick 3 — Quotes
- Quote builder against a simple products/pricing table
- Quote → convert to Job (one click)
- Quote statuses: Draft / Sent / Accepted / Declined

## Brick 4 — Pricing Library
- Products, materials, finishes, suppliers, machine + labour costs, margin rules
- Quotes pull from this instead of manual entry

## Brick 5 — Production Board
- Kanban-style view of jobs by status, drag to update

## Later (needs real integration work, not just app code)
- Outlook sync (Microsoft Graph API) — emails attached to customer records
- AI assistant panel — quote drafting from natural-language job descriptions
- WhatsApp Business integration

## Database schema (Brick 1–2 scope)

```sql
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz default now()
);

create table customer_activity (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  text text not null,
  logged_by text,
  created_at timestamptz default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text unique not null,
  customer_id uuid references customers(id) on delete restrict,
  product_type text,
  status text not null default 'New Enquiry',
  assigned_to text,
  due_date date,
  priority text default 'Normal',
  notes text,
  created_at timestamptz default now()
);

create table users (
  id uuid primary key references auth.users(id),
  name text,
  role text not null default 'sales' -- admin | sales | designer | production | accounts
);
```

## User roles
| Role | Access |
|---|---|
| Admin | Everything |
| Sales | Customers, Quotes, Jobs |
| Designer | Jobs, Artwork, Proofs |
| Production | Production board only |
| Accounts | Invoices & payments (later brick) |

## First Claude Code prompt to use
> Read xpress-os-blueprint.md. Set up a Next.js + TypeScript + Tailwind project,
> connect it to my Supabase project, run the Brick 1 schema, and build Brick 1 only:
> login, app shell, and the Customers module. Deploy to Vercel when working.
