-- Add foreign key from topup_requests to profiles
-- This allows joining topup_requests with profiles table
ALTER TABLE public.topup_requests
ADD CONSTRAINT topup_requests_user_id_fkey_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;