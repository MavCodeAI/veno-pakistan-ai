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
    console.log("Generating video with prompt:", prompt);

    // Call the video generation API
    const apiUrl = `https://yabes-api.pages.dev/api/ai/video?prompt=${encodeURIComponent(prompt)}`;
    console.log("Calling API:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "GET",
    });

    console.log("API Response status:", response.status);
    const responseText = await response.text();
    console.log("API Response body:", responseText);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", e);
      throw new Error("Invalid API response format");
    }

    // Extract video URL from various possible response formats
    const videoUrl = data.videoUrl || data.url || data.video_url || data.result?.url || data.data?.url;
    
    if (!videoUrl) {
      console.error("No video URL in response:", data);
      throw new Error("No video URL received from API");
    }

    console.log("Video generated successfully:", videoUrl);

    return new Response(
      JSON.stringify({ videoUrl, message: "Video generated successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error generating video:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate video" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
