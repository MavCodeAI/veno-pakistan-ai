import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Mail, Calendar, Video, Zap, Edit2, Save, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  created_at: string;
}

interface Stats {
  totalVideos: number;
  premiumVideos: number;
  freeVideos: number;
}

export const UserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ totalVideos: 0, premiumVideos: 0, freeVideos: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        toast.error("Profile نہیں ملی");
        return;
      }

      setProfile(profileData);
      setDisplayName(profileData.display_name || "");

      // Load stats
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("is_premium")
        .eq("user_id", user.id);

      if (videosError) throw videosError;

      const totalVideos = videosData?.length || 0;
      const premiumVideos = videosData?.filter(v => v.is_premium).length || 0;
      const freeVideos = totalVideos - premiumVideos;

      setStats({ totalVideos, premiumVideos, freeVideos });
    } catch (error: any) {
      toast.error("Failed to load profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditing(false);
      loadProfile();
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.display_name
    ? profile.display_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : profile.email.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-4 border-primary shadow-glow">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            {editing ? (
              <div className="w-full max-w-md space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditing(false);
                      setDisplayName(profile.display_name || "");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">
                  {profile.display_name || "Anonymous User"}
                </h3>
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-primary/10 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-3xl font-bold text-primary">{stats.totalVideos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-accent/10 border-accent/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Premium Videos</p>
                <p className="text-3xl font-bold text-accent">{stats.premiumVideos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Video className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Free Videos</p>
                <p className="text-3xl font-bold">{stats.freeVideos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
