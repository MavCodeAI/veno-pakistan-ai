-- Create function to deduct wallet balance
CREATE OR REPLACE FUNCTION public.deduct_wallet_balance(
  user_id UUID,
  amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.profiles
  SET wallet_balance = wallet_balance - amount
  WHERE id = user_id;
END;
$$;