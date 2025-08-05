-- Migration: clean_up_profiles_rls_policies
-- Created at: 1754352944

-- Drop duplicate policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Keep the cleaner versions
-- The remaining policies should be:
-- "System can insert profiles" (for service_role)
-- "Users can insert their own profile" (for public)
-- "Users can update their own profile" (for public)
-- "Users can view their own profile" (for public)

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;;