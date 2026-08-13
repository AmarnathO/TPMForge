-- TPMForge — subscription plans: add one-time ₹2,000 plan (1 analysis + 1 assessment + 1 mock interview)
-- and keep legacy values valid for existing rows.

alter table public.subscriptions drop constraint subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('monthly', 'annual', 'one-time'));
