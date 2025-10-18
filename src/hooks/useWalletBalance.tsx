import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWalletBalance = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setBalance(data?.wallet_balance || 0);
    } catch (error) {
      console.error("Failed to load wallet balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();

    // Setup realtime subscription
    const channel = supabase
      .channel('wallet-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload: any) => {
          if (payload.new.wallet_balance !== undefined) {
            setBalance(payload.new.wallet_balance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { balance, loading, refresh: loadBalance };
};
