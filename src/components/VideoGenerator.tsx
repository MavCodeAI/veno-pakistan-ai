import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Loader2, Download, Share2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getRandomPrompts } from "@/data/viralPrompts";

interface VideoGeneratorProps {
  isPremium?: boolean;
}

export const VideoGenerator = ({ isPremium = false }: VideoGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [displayedPrompts, setDisplayedPrompts] = useState<string[]>([]);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    refreshPrompts();
  }, []);

  const refreshPrompts = () => {
    setDisplayedPrompts(getRandomPrompts(6));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setVideoUrl(""); // Clear previous video
    setProgress("Initializing video generation...");
    
    try {
      // Show progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const messages = [
            "Creating your video...",
            "Processing your prompt...",
            "Generating scenes...",
            "Adding effects...",
            "Almost ready...",
          ];
          const currentIndex = messages.indexOf(prev);
          return messages[(currentIndex + 1) % messages.length];
        });
      }, 4000);

      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { prompt, isPremium },
      });

      clearInterval(progressInterval);

      if (error) {
        // Handle specific error messages from edge function
        if (error.message?.includes("Daily free video limit reached")) {
          toast.error("آپ کی آج کی مفت videos کی حد ختم ہو گئی ہے۔ کل دوبارہ کوشش کریں!");
        } else if (error.message?.includes("Insufficient wallet balance")) {
          toast.error("Wallet میں balance کافی نہیں ہے۔ براہ کرم top-up کریں۔");
        } else if (error.message?.includes("timed out")) {
          toast.error("Video generation took too long. Please try again.");
        } else {
          toast.error(error.message || "Video بنانے میں مسئلہ ہوا");
        }
        throw error;
      }

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setProgress("Complete! 🎉");
        toast.success("✨ Video کامیابی سے بن گئی!");
      }
    } catch (error: any) {
      console.error("Video generation error:", error);
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    
    try {
      toast.info("Starting download...");
      
      // Use a more reliable download method
      const response = await fetch(videoUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `veno-video-${Date.now()}.mp4`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      toast.success("Video download شروع ہو گئی!");
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(videoUrl, '_blank');
      toast.info("Opening video in new tab for download");
    }
  };

  const handleShare = () => {
    const text = `Check out this AI-generated video I made with Veno! 🎥✨`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + "\n" + videoUrl)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border shadow-card">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Video Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to create..."
              className="min-h-32 bg-muted/50 border-border resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Viral Prompts</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshPrompts}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {displayedPrompts.map((p, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(p)}
                  className="text-xs border-border hover:border-accent hover:text-accent justify-start h-auto py-2 px-3"
                >
                  <span className="line-clamp-2 text-left">{p}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
          
          {loading && progress && (
            <div className="text-center text-sm text-muted-foreground animate-pulse">
              {progress}
            </div>
          )}
        </div>
      </Card>

      {videoUrl && (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border shadow-card animate-fade-in">
          <div className="space-y-4">
            <div className="relative">
              <video
                src={videoUrl}
                controls
                controlsList="nodownload"
                className="w-full rounded-lg shadow-lg"
                playsInline
              />
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                {isPremium ? "HD Quality" : "Free"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 bg-gradient-accent hover:opacity-90 text-accent-foreground"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
