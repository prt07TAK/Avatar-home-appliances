-- ============================================
-- 1. Modify users table to support auth linking
-- ============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- ============================================
-- 2. Auto-Confirm Email Trigger
-- ============================================
-- This ensures that when a user signs up via Supabase Auth, they don't need to check their email.
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- ============================================
-- 3. Auto-Create Public Profile Trigger
-- ============================================
-- When an auth user is created, create a default profile in public.users
CREATE OR REPLACE FUNCTION public.create_public_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name, phone)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_profile_created ON auth.users;
CREATE TRIGGER on_auth_user_profile_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_public_profile();

-- ============================================
-- 4. Row Level Security for Storefront Users
-- ============================================
-- Enable RLS on users if not already
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth_id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth_id = auth.uid());

-- Keep the insert policy for guest checkout (guests don't have auth.uid())
-- Wait, the existing policy is just FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "users_insert" ON public.users;
CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (true);

-- Orders RLS for storefront users
-- Allow users to SELECT their own orders
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );
