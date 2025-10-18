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

    console.log("Calling Yabes API V2 with prompt:", prompt);

    // Step 1: Create video generation task with V2 API
    const createUrl = `https://yabes-api.pages.dev/api/ai/video/v2?action=create&prompt=${encodeURIComponent(prompt)}`;
    const createResponse = await fetch(createUrl, {
      method: "GET",
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Yabes API V2 create error:", errorText);
      throw new Error(`Video generation failed: ${errorText}`);
    }

    const createData = await createResponse.json();
    console.log("Yabes API V2 create response:", createData);

    const taskId = createData.taskId || createData.task_id || createData.id;
    
    if (!taskId) {
      console.error("No task ID in response:", createData);
      throw new Error("No task ID in API response");
    }

    // Step 2: Poll for video completion (max 60 seconds, check every 3 seconds)
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (!videoUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      attempts++;
      
      console.log(`Checking status, attempt ${attempts}/${maxAttempts}`);
      
      const statusUrl = `https://yabes-api.pages.dev/api/ai/video/v2?action=status&taskId=${taskId}`;
      const statusResponse = await fetch(statusUrl, {
        method: "GET",
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log("Status response:", statusData);
        
        // Check if video is ready
        if (statusData.status === "completed" || statusData.state === "completed") {
          videoUrl = statusData.videoUrl || statusData.url || statusData.video_url || statusData.result?.url;
        } else if (statusData.status === "failed" || statusData.state === "failed") {
          throw new Error("Video generation failed");
        }
        // If still processing, continue polling
      }
    }
    
    if (!videoUrl) {
      throw new Error("Video generation timed out. Please try again.");
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
