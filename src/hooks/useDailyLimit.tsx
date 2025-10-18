import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDailyLimit = () => {
  const [dailyUsage, setDailyUsage] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDailyUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc("get_daily_video_count", {
        user_uuid: user.id,
      });

      if (error) throw error;
      setDailyUsage(data || 0);
    } catch (error) {
      console.error("Failed to load daily usage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyUsage();

    // Setup realtime subscription
    const channel = supabase
      .channel('daily-limit-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'videos'
        },
        () => {
          loadDailyUsage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { dailyUsage, loading, refresh: loadDailyUsage };
};
