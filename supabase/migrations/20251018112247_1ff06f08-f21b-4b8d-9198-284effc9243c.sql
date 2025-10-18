-- Trigger types regeneration with a simple comment update
-- This ensures all existing tables and functions are properly typed

-- Add helpful comment to profiles table
COMMENT ON TABLE public.profiles IS 'User profile information including wallet balance and display details';

-- Add helpful comments to other tables
COMMENT ON TABLE public.videos IS 'Generated video records with status tracking';
COMMENT ON TABLE public.topup_requests IS 'Wallet top-up requests pending admin approval';
COMMENT ON TABLE public.admin_users IS 'Users with administrative privileges';