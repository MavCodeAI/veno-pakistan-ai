import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoGenerator } from "@/components/VideoGenerator";
import { VideoStats } from "@/components/VideoStats";
import { VideoHistory } from "@/components/VideoHistory";
import { Sparkles, Video, History } from "lucide-react";

const Dashboard = () => {
  const [loading] = useState(false);

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
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Veno
                </h1>
                <p className="text-xs text-muted-foreground">Free AI Video Generator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Stats */}
          <div className="space-y-4 animate-fade-in">
            <VideoStats />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="generate" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <Video className="mr-2 h-4 w-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-muted">
                <History className="mr-2 h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="mt-6">
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Free Video Generation
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Unlimited videos</li>
                    <li>✓ HD quality</li>
                    <li>✓ No watermark</li>
                    <li>✓ All viral prompts</li>
                  </ul>
                </div>
                <VideoGenerator isPremium={false} />
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <VideoHistory />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
