-- TPMForge — Product Mentor Agent assessment (product understanding)

create table if not exists public.product_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb,
  mcq_score int check (mcq_score between 0 and 100),
  descriptive_score int check (descriptive_score between 0 and 100),
  dimension_scores jsonb,
  overall_score int check (overall_score between 0 and 100),
  summary text,
  answer_feedback jsonb,
  roadmap jsonb,
  model text,
  tokens_used int,
  graded boolean default false,
  created_at timestamptz default now()
);

alter table public.product_assessments enable row level security;

create policy "Users can view own product assessments"
  on public.product_assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert own product assessments"
  on public.product_assessments for insert
  with check (auth.uid() = user_id);

create index idx_product_assessments_user on public.product_assessments (user_id);
create index idx_product_assessments_created on public.product_assessments (created_at desc);
