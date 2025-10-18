import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, isPremium } = await req.json();

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check wallet balance for premium users
    if (isPremium) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.wallet_balance < 20) {
        throw new Error("Insufficient wallet balance");
      }
    }

    // Check daily limit for free users
    if (!isPremium) {
      const today = new Date().toISOString().split("T")[0];
      const { count, error: countError } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_premium", false)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      if (countError) throw countError;
      
      if (count && count >= 7) {
        throw new Error("Daily free video limit reached (7/day)");
      }
    }

    console.log("Calling Yabes API with prompt:", prompt);

    // Call Yabes Text-to-Video API
    const yabesResponse = await fetch("https://yabes-api.pages.dev/api/ai/video/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    if (!yabesResponse.ok) {
      const errorText = await yabesResponse.text();
      console.error("Yabes API error:", errorText);
      throw new Error(`Video generation failed: ${errorText}`);
    }

    const yabesData = await yabesResponse.json();
    console.log("Yabes API response:", yabesData);

    // Extract video URL from response
    const videoUrl = yabesData.videoUrl || yabesData.url || yabesData.result?.url;
    
    if (!videoUrl) {
      console.error("No video URL in response:", yabesData);
      throw new Error("No video URL in API response");
    }

    // Save video record to database
    const { error: insertError } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        prompt,
        video_url: videoUrl,
        is_premium: isPremium,
        status: "completed",
      });

    if (insertError) {
      console.error("Failed to save video:", insertError);
    }

    // Deduct wallet balance for premium
    if (isPremium) {
      const { error: updateError } = await supabase.rpc("deduct_wallet_balance", {
        user_id: user.id,
        amount: 20,
      });

      if (updateError) {
        console.error("Failed to deduct balance:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ videoUrl, message: "Video generated successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate video" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
