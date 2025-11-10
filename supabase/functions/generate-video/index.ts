import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

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
