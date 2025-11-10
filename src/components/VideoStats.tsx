import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Video, TrendingUp, Clock, Award, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VideoStats {
  total: number;
  premium: number;
  free: number;
  today: number;
  thisWeek: number;
  completed: number;
}

export const VideoStats = () => {
  const [stats, setStats] = useState<VideoStats>({
    total: 0,
    premium: 0,
    free: 0,
    today: 0,
    thisWeek: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Realtime updates
    const channel = supabase
      .channel('stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, loadStats)
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStats = async () => {
    try {
      const { data: allVideos } = await supabase
        .from("videos")
        .select("*");

      if (allVideos) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setStats({
          total: allVideos.length,
          premium: 0,
          free: allVideos.length,
          today: allVideos.filter((v: any) => new Date(v.created_at) >= today).length,
          thisWeek: allVideos.filter((v: any) => new Date(v.created_at) >= weekAgo).length,
          completed: allVideos.filter((v: any) => v.status === 'completed').length,
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
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-card/30">
              <CardContent className="p-3">
                <div className="h-16 bg-muted/50 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-glow transition-all group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Video className="h-3 w-3 group-hover:scale-110 transition-transform" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:shadow-glow transition-all group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3 w-3 group-hover:scale-110 transition-transform" />
              Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500 group-hover:scale-110 transition-transform">{stats.free}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:shadow-glow transition-all group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3 group-hover:scale-110 transition-transform" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500 group-hover:scale-110 transition-transform">{stats.today}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:shadow-glow transition-all group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-3 w-3 group-hover:scale-110 transition-transform" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500 group-hover:scale-110 transition-transform">{stats.thisWeek}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-glow transition-all group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-3 w-3 group-hover:scale-110 transition-transform" />
              Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 group-hover:scale-110 transition-transform">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Success Rate</span>
              <span className="font-bold text-accent text-lg">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.completed} of {stats.total} videos completed successfully
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};