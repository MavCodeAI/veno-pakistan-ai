import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Search, Download, Eye, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VideoRecord {
  id: string;
  user_id: string;
  prompt: string;
  video_url: string;
  is_premium: boolean;
  created_at: string;
  profiles: { email: string };
}

export const AdminVideoManager = () => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = videos.filter(
        (v) =>
          v.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.profiles.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [searchQuery, videos]);

  const loadVideos = async () => {
    try {
      const { data: videos, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Get unique user IDs
      const userIds = [...new Set(videos?.map((v: any) => v.user_id) || [])];
      
      // Fetch profiles for these users
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profileError) throw profileError;

      // Map profiles to videos
      const videosWithProfiles = videos?.map((video: any) => ({
        ...video,
        profiles: profiles?.find((p: any) => p.id === video.user_id) || { email: "Unknown" },
      })) || [];

      setVideos(videosWithProfiles);
      setFilteredVideos(videosWithProfiles);
    } catch (error: any) {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase.from("videos").delete().eq("id", videoId);

      if (error) throw error;

      toast.success("Video deleted successfully");
      loadVideos();
    } catch (error: any) {
      toast.error("Failed to delete video");
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Video Management
        </CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by prompt or user email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No videos found matching your search" : "No videos yet"}
            </div>
          ) : (
            filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-muted/30 p-4 rounded-lg border border-border space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {video.profiles.email}
                      </span>
                      <Badge
                        variant={video.is_premium ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {video.is_premium ? "Premium" : "Free"}
                      </Badge>
                    </div>
                    <p className="text-sm line-clamp-2">{video.prompt}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(video.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(video.video_url, "_blank")}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(video.video_url, "_blank")}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          video record from the database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(video.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
