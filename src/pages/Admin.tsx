import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, Clock, User, Video, FileText } from "lucide-react";
import { AdminVideoManager } from "@/components/AdminVideoManager";

interface Profile {
  email: string;
}

interface TopupRequest {
  id: string;
  user_id: string;
  amount: number;
  phone_number: string;
  status: string;
  transaction_id: string | null;
  created_at: string;
  profiles: Profile;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!adminData) {
      toast.error("Unauthorized access");
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    loadRequests();
    setLoading(false);
  };

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("topup_requests")
      .select(`
        *,
        profiles (email)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load requests");
      return;
    }

    setRequests(data || []);
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("approve_topup", {
        request_id: requestId,
        admin_id: user.id,
      });

      if (error) throw error;

      toast.success("Top-up approved successfully!");
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve top-up");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase
        .from("topup_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("Request rejected");
      loadRequests();
    } catch (error: any) {
      toast.error("Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow">
                <Shield className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-xs text-muted-foreground">Veno Top-up Management</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-border"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="topups" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="topups" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <FileText className="mr-2 h-4 w-4" />
                Top-up Requests
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-gradient-accent data-[state=active]:text-accent-foreground">
                <Video className="mr-2 h-4 w-4" />
                Video Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="topups" className="mt-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-yellow-500/10 border-yellow-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-500">
                      {pendingRequests.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Approved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">
                      {approvedRequests.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/10 border-red-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Rejected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-500">
                      {rejectedRequests.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Requests */}
              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    Pending Top-up Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending requests
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="bg-muted/30 p-4 rounded-lg border border-border space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{request.profiles.email}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Phone: {request.phone_number}
                              </div>
                              {request.transaction_id && (
                                <div className="text-sm text-muted-foreground">
                                  Transaction: {request.transaction_id}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {new Date(request.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-accent">
                                Rs {request.amount}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(request.id)}
                              disabled={processing === request.id}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(request.id)}
                              disabled={processing === request.id}
                              variant="outline"
                              className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent History */}
              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card">
                <CardHeader>
                  <CardTitle>Recent History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {requests.slice(0, 10).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <div className="font-medium">{request.profiles.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">Rs {request.amount}</span>
                          <Badge
                            variant={
                              request.status === "approved"
                                ? "default"
                                : request.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <AdminVideoManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
