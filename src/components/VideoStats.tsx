import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Video, Zap, TrendingUp, Clock } from "lucide-react";

interface VideoStats {
  total: number;
  premium: number;
  free: number;
  today: number;
}

export const VideoStats = () => {
  const [stats, setStats] = useState<VideoStats>({
    total: 0,
    premium: 0,
    free: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all videos for user
      const { data: allVideos } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", user.id);

      if (allVideos) {
        const today = new Date().toISOString().split("T")[0];
        const todayVideos = allVideos.filter((v: any) =>
          v.created_at.startsWith(today)
        );

        setStats({
          total: allVideos.length,
          premium: allVideos.filter((v: any) => v.is_premium).length,
          free: allVideos.filter((v: any) => !v.is_premium).length,
          today: todayVideos.length,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-card/30">
            <CardContent className="p-4">
              <div className="h-16 bg-muted/50 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Video className="h-3 w-3" />
            Total Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Premium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{stats.premium}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Free Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">{stats.free}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{stats.today}</div>
        </CardContent>
      </Card>
    </div>
  );
};
