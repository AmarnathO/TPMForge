-- TPMForge — TPM readiness test (business / technology / product)

create table if not exists public.readiness_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb,
  aspect_scores jsonb,
  overall_score int check (overall_score between 0 and 100),
  stand_label text,
  created_at timestamptz default now()
);

alter table public.readiness_tests enable row level security;

create policy "Users can view own readiness tests"
  on public.readiness_tests for select
  using (auth.uid() = user_id);

create policy "Users can insert own readiness tests"
  on public.readiness_tests for insert
  with check (auth.uid() = user_id);

create index idx_readiness_tests_user on public.readiness_tests (user_id);
create index idx_readiness_tests_created on public.readiness_tests (created_at desc);
