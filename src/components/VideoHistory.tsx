import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Video as VideoIcon, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Video {
  id: string;
  prompt: string;
  video_url: string | null;
  is_premium: boolean;
  status: string;
  created_at: string;
}

export const VideoHistory = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
    
    // Setup realtime subscription
    const channel = supabase
      .channel('video-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'videos'
        },
        () => {
          loadVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadVideos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast.error("Failed to load videos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veno-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Video download شروع ہو گئی!");
    } catch (error) {
      toast.error("Download میں مسئلہ ہوا");
    }
  };

  const handleShare = (videoUrl: string, prompt: string) => {
    const text = `Check out this AI-generated video: "${prompt}" 🎥✨`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + "\n" + videoUrl)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border">
        <VideoIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No Videos Yet</h3>
        <p className="text-muted-foreground">
          Your generated videos will appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="p-6 bg-card/50 backdrop-blur-sm border-border shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Video Preview */}
            <div className="flex-shrink-0 w-full md:w-64">
              {video.video_url && video.status === "completed" ? (
                <video
                  src={video.video_url}
                  controls
                  className="w-full rounded-lg border border-border"
                />
              ) : (
                <div className="w-full h-48 bg-muted/30 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
                    <p className="text-sm text-muted-foreground">
                      {video.status === "pending" ? "Generating..." : "Failed"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium line-clamp-2">{video.prompt}</p>
                <div className="flex gap-2">
                  {video.is_premium && (
                    <Badge className="bg-gradient-accent text-accent-foreground border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <Badge variant={video.status === "completed" ? "default" : "secondary"}>
                    {video.status}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {new Date(video.created_at).toLocaleString()}
              </p>

              {video.video_url && video.status === "completed" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleDownload(video.video_url!)}
                    className="flex-1 bg-muted hover:bg-muted/80"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleShare(video.video_url!, video.prompt)}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
