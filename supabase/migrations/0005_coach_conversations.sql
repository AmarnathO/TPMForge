-- TPMForge — P9: coach conversation persistence

create table if not exists public.coach_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Coach conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coach_conversations enable row level security;

create policy "Users can view own coach conversations"
  on public.coach_conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own coach conversations"
  on public.coach_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own coach conversations"
  on public.coach_conversations for update
  using (auth.uid() = user_id);

create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.coach_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  model_used text,
  tokens_used int,
  created_at timestamptz not null default now()
);

alter table public.coach_messages enable row level security;

create policy "Users can view own coach messages"
  on public.coach_messages for select
  using (
    exists (
      select 1 from public.coach_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can insert into own coach conversations"
  on public.coach_messages for insert
  with check (
    exists (
      select 1 from public.coach_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create index idx_coach_conversations_user on public.coach_conversations (user_id, updated_at desc);
create index idx_coach_messages_conversation on public.coach_messages (conversation_id, created_at asc);
