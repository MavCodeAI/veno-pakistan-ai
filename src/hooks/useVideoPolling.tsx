import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseVideoPollingProps {
  videoId: string | null;
  onComplete: (videoUrl: string) => void;
  onError: (error: string) => void;
}

export const useVideoPolling = ({ videoId, onComplete, onError }: UseVideoPollingProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Poll every 3 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("videos")
          .select("status, video_url")
          .eq("id", videoId)
          .single();

        if (error) throw error;

        if (data.status === "completed" && data.video_url) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete(data.video_url);
        } else if (data.status === "failed") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onError("Video generation failed");
        }
      } catch (error: any) {
        console.error("Polling error:", error);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onError(error.message);
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [videoId, onComplete, onError]);

  return null;
};