-- Fix infinite recursion in admin_users RLS policy
-- First drop the problematic policy
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = user_id
  )
$$;

-- Create a new policy using the security definer function
CREATE POLICY "Admins can view admin users"
ON public.admin_users
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Also fix Dashboard and Profile queries by creating helper function
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = user_id
  )
$$;