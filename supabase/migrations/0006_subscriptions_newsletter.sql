-- TPMForge — P10 + P8: newsletter subscribers and paid subscriptions

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe to the newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "Only authenticated users can view subscribers"
  on public.newsletter_subscribers for select
  using (auth.role() = 'authenticated');

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'annual')),
  amount_paise int not null,
  currency text not null default 'INR',
  status text not null check (status in ('active', 'cancelled', 'expired')),
  razorpay_order_id text,
  razorpay_payment_id text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create index idx_subscriptions_user on public.subscriptions (user_id, created_at desc);
