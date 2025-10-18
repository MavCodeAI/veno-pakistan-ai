-- Create admin roles table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin can view all admins
CREATE POLICY "Admins can view admin users"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- Create top-up requests table
CREATE TABLE public.topup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.topup_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own topup requests"
  ON public.topup_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create topup requests"
  ON public.topup_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all topup requests"
  ON public.topup_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- Admins can update requests
CREATE POLICY "Admins can update topup requests"
  ON public.topup_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- Function to approve topup
CREATE OR REPLACE FUNCTION public.approve_topup(
  request_id UUID,
  admin_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  req_user_id UUID;
  req_amount INTEGER;
BEGIN
  -- Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Not an admin';
  END IF;

  -- Get request details
  SELECT user_id, amount INTO req_user_id, req_amount
  FROM public.topup_requests
  WHERE id = request_id AND status = 'pending';

  IF req_user_id IS NULL THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  -- Update wallet balance
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + req_amount
  WHERE id = req_user_id;

  -- Mark request as approved
  UPDATE public.topup_requests
  SET status = 'approved',
      approved_at = now(),
      approved_by = admin_id
  WHERE id = request_id;
END;
$$;

-- Make profiles readable for admins to show user emails
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- Admins can view all videos
CREATE POLICY "Admins can view all videos"
  ON public.videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );