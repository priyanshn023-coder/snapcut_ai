/*
# Create SnapCut AI core schema

1. New Tables
- `profiles` stores each user's editable account profile and current plan label.
- `usage` stores one server-owned daily usage counter per user.
- `processing_jobs` stores processing metadata, status, and temporary result references.
- `credits` stores the current balance plus purchased and used totals.
- `credit_transactions` stores an auditable ledger for credit changes.
- `subscriptions` stores provider subscription state and billing periods.
- `payments` stores verified provider payment records and idempotency identifiers.

2. Security
- Row Level Security is enabled on every table.
- Authenticated users can only read and manage records belonging to their own auth user.
- Provider and billing records are not writable by the browser.

3. Important notes
- User-owned identifiers default to `auth.uid()` so client inserts do not need to trust a submitted user id.
- Usage date is unique per user to prevent duplicate daily counters.
- Payment provider identifiers are unique to prevent duplicate credit allocation.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT current_date,
  images_processed integer NOT NULL DEFAULT 0 CHECK (images_processed >= 0),
  credits_used integer NOT NULL DEFAULT 0 CHECK (credits_used >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, usage_date)
);

CREATE TABLE IF NOT EXISTS public.processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  input_format text NOT NULL,
  input_size integer NOT NULL CHECK (input_size > 0 AND input_size <= 10485760),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  provider text,
  processing_duration integer,
  result_url text,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased integer NOT NULL DEFAULT 0 CHECK (total_purchased >= 0),
  total_used integer NOT NULL DEFAULT 0 CHECK (total_used >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'adjustment')),
  amount integer NOT NULL CHECK (amount > 0),
  reference_id text,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'razorpay',
  provider_subscription_id text UNIQUE,
  plan text NOT NULL CHECK (plan IN ('pro', 'business')),
  status text NOT NULL CHECK (status IN ('created', 'active', 'paused', 'cancelled', 'completed', 'halted')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'razorpay',
  provider_payment_id text UNIQUE,
  provider_order_id text UNIQUE,
  amount integer NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  plan text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS processing_jobs_user_created_idx ON public.processing_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS credit_transactions_user_created_idx ON public.credit_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_user_created_idx ON public.payments (user_id, created_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usage_select_own" ON public.usage;
CREATE POLICY "usage_select_own" ON public.usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "usage_insert_own" ON public.usage;
CREATE POLICY "usage_insert_own" ON public.usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "usage_update_own" ON public.usage;
CREATE POLICY "usage_update_own" ON public.usage FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "usage_delete_own" ON public.usage;
CREATE POLICY "usage_delete_own" ON public.usage FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "jobs_select_own" ON public.processing_jobs;
CREATE POLICY "jobs_select_own" ON public.processing_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "jobs_insert_own" ON public.processing_jobs;
CREATE POLICY "jobs_insert_own" ON public.processing_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "jobs_update_own" ON public.processing_jobs;
CREATE POLICY "jobs_update_own" ON public.processing_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "jobs_delete_own" ON public.processing_jobs;
CREATE POLICY "jobs_delete_own" ON public.processing_jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "credits_select_own" ON public.credits;
CREATE POLICY "credits_select_own" ON public.credits FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "credits_insert_own" ON public.credits;
CREATE POLICY "credits_insert_own" ON public.credits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "credits_update_own" ON public.credits;
CREATE POLICY "credits_update_own" ON public.credits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "credits_delete_own" ON public.credits;
CREATE POLICY "credits_delete_own" ON public.credits FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "credit_transactions_select_own" ON public.credit_transactions;
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "credit_transactions_insert_own" ON public.credit_transactions;
CREATE POLICY "credit_transactions_insert_own" ON public.credit_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "credit_transactions_update_own" ON public.credit_transactions;
CREATE POLICY "credit_transactions_update_own" ON public.credit_transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "credit_transactions_delete_own" ON public.credit_transactions;
CREATE POLICY "credit_transactions_delete_own" ON public.credit_transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "subscriptions_delete_own" ON public.subscriptions;
CREATE POLICY "subscriptions_delete_own" ON public.subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own" ON public.payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "payments_delete_own" ON public.payments;
CREATE POLICY "payments_delete_own" ON public.payments FOR DELETE TO authenticated USING (auth.uid() = user_id);
