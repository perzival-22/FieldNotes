-- Enable RLS
alter table jobs enable row level security;
alter table materials enable row level security;
alter table quotes enable row level security;

-- Jobs policies
create policy "Users can read own jobs" on jobs for select using (auth.uid() = user_id);
create policy "Users can insert own jobs" on jobs for insert with check (auth.uid() = user_id);
create policy "Users can update own jobs" on jobs for update using (auth.uid() = user_id);
create policy "Users can delete own jobs" on jobs for delete using (auth.uid() = user_id);

-- Materials policies (via job ownership)
create policy "Users can read own materials" on materials for select
  using (exists (select 1 from jobs where jobs.id = materials.job_id and jobs.user_id = auth.uid()));
create policy "Users can insert own materials" on materials for insert
  with check (exists (select 1 from jobs where jobs.id = materials.job_id and jobs.user_id = auth.uid()));
create policy "Users can update own materials" on materials for update
  using (exists (select 1 from jobs where jobs.id = materials.job_id and jobs.user_id = auth.uid()));
create policy "Users can delete own materials" on materials for delete
  using (exists (select 1 from jobs where jobs.id = materials.job_id and jobs.user_id = auth.uid()));

-- Quotes policies
create policy "Users can read own quotes" on quotes for select using (auth.uid() = user_id);
create policy "Users can insert own quotes" on quotes for insert with check (auth.uid() = user_id);
create policy "Users can update own quotes" on quotes for update using (auth.uid() = user_id);
create policy "Users can delete own quotes" on quotes for delete using (auth.uid() = user_id);
