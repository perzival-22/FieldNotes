-- Jobs
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  client_name text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  job_type text not null default 'residential',
  status text not null default 'quote',
  description text not null default '',
  labour_notes text not null default '',
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Materials
create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  name text not null default '',
  cost numeric not null default 0,
  quantity numeric not null default 1,
  created_at timestamptz not null default now()
);

-- Quotes
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  reference text not null default '',
  status text not null default 'draft',
  labour_items jsonb not null default '[]',
  vat_rate numeric not null default 20,
  subtotal numeric not null default 0,
  vat_amount numeric not null default 0,
  total numeric not null default 0,
  valid_until date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists jobs_user_id_idx on jobs(user_id);
create index if not exists materials_job_id_idx on materials(job_id);
create index if not exists quotes_job_id_idx on quotes(job_id);
