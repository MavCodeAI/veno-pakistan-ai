-- Make transaction_id required for topup_requests
ALTER TABLE public.topup_requests 
ALTER COLUMN transaction_id SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_user_created ON public.videos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topup_requests_user_status ON public.topup_requests(user_id, status);

-- Enable realtime for videos table
ALTER TABLE public.videos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;

-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Add display_name to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create function to get daily video count
CREATE OR REPLACE FUNCTION public.get_daily_video_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  video_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO video_count
  FROM public.videos
  WHERE user_id = user_uuid
    AND is_premium = false
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  RETURN COALESCE(video_count, 0);
END;
$$;