import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VideoGenerator } from "@/components/VideoGenerator";
import { DailyLimitCard } from "@/components/DailyLimitCard";
import { WalletCard } from "@/components/WalletCard";
import { Sparkles, LogOut, Zap, Video, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { useDailyLimit } from "@/hooks/useDailyLimit";
import { useWalletBalance } from "@/hooks/useWalletBalance";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { dailyUsage, loading: dailyLoading } = useDailyLimit();
  const { balance: walletBalance, loading: balanceLoading } = useWalletBalance();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);

    // Check if admin using security definer function
    try {
      const { data: isAdminData, error } = await supabase.rpc("check_user_is_admin", {
        user_id: user.id,
      });
      
      if (!error) {
        setIsAdmin(isAdminData || false);
      }
    } catch (error) {
      console.error("Admin check error:", error);
      setIsAdmin(false);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Veno
                </h1>
                <p className="text-xs text-muted-foreground">AI Video Generator</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className="border-border hover:border-primary hover:text-primary"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-border hover:border-destructive hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <DailyLimitCard used={dailyUsage} limit={7} loading={dailyLoading} />
            <WalletCard balance={walletBalance} loading={balanceLoading} />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="free" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="free" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <Video className="mr-2 h-4 w-4" />
                Free Videos
              </TabsTrigger>
              <TabsTrigger value="premium" className="data-[state=active]:bg-gradient-accent data-[state=active]:text-accent-foreground">
                <Zap className="mr-2 h-4 w-4" />
                Premium
              </TabsTrigger>
            </TabsList>

            <TabsContent value="free" className="mt-6">
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Free Plan Features
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ 7 videos per day</li>
                    <li>✓ Small watermark included</li>
                    <li>✓ Standard quality</li>
                    <li>✓ All viral prompts</li>
                  </ul>
                </div>
                <VideoGenerator isPremium={false} />
              </div>
            </TabsContent>

            <TabsContent value="premium" className="mt-6">
              <div className="space-y-4">
                <div className="bg-gradient-accent/10 border border-accent/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Premium Features
                  </h3>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    <li>✓ HD quality videos</li>
                    <li>✓ No watermark</li>
                    <li>✓ Fast generation (priority queue)</li>
                    <li>✓ Rs 20 per video</li>
                  </ul>
                </div>
                {walletBalance < 20 ? (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
                    <p className="text-destructive font-medium mb-4">
                      Insufficient balance. Please top up your wallet to use premium features.
                    </p>
                    <Button
                      onClick={() => window.open("https://wa.me/923168076207?text=Hi! I want to top up my Veno wallet.", "_blank")}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Top Up via WhatsApp
                    </Button>
                  </div>
                ) : (
                  <VideoGenerator isPremium={true} />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
