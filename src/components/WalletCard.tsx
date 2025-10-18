import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WalletCardProps {
  balance: number;
  loading?: boolean;
}

export const WalletCard = ({ balance, loading: balanceLoading }: WalletCardProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitRequest = async () => {
    if (!amount || !phoneNumber || !transactionId) {
      toast.error("براہ کرم تمام ضروری معلومات بھریں");
      return;
    }

    const amountNum = parseInt(amount);
    if (amountNum < 100) {
      toast.error("کم سے کم top-up رقم Rs 100 ہے");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("topup_requests").insert({
        user_id: user.id,
        amount: amountNum,
        phone_number: phoneNumber,
        transaction_id: transactionId,
        status: "pending",
      });

      if (error) throw error;

      toast.success("✅ Top-up request جمع ہو گئی! Admin جلد منظور کریں گے۔");
      setOpen(false);
      setAmount("");
      setPhoneNumber("");
      setTransactionId("");
    } catch (error: any) {
      toast.error(error.message || "Request جمع کرنے میں مسئلہ ہوا");
    } finally {
      setLoading(false);
    }
  };

  const quickTopUp = (amt: number) => {
    setAmount(amt.toString());
  };

  if (balanceLoading) {
    return (
      <Card className="bg-gradient-accent border-0 shadow-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-32 bg-white/20" />
          <Skeleton className="h-10 w-full bg-white/20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-accent border-0 shadow-glow hover:shadow-[0_0_50px_hsl(var(--accent)/0.4)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wallet className="h-5 w-5" />
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-4xl font-bold text-white">Rs {balance}</div>
          <p className="text-sm text-white/80 mt-1">
            Rs 20 per premium video
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-white text-accent hover:bg-white/90 shadow-card">
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Request Top-Up
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Request Wallet Top-Up</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (Rs) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  className="bg-muted/50 border-border"
                />
                <div className="flex gap-2">
                  {[100, 200, 500].map((amt) => (
                    <Button
                      key={amt}
                      onClick={() => quickTopUp(amt)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border"
                    >
                      Rs {amt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your Phone Number *</Label>
                <Input
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-muted/50 border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Transaction ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="JazzCash/EasyPaisa transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="bg-muted/50 border-border"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Verification کے لیے ضروری ہے
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Payment Instructions:</strong>
                  <br />
                  1. Send Rs {amount || "XXX"} to: <strong>03168076207</strong> (JazzCash/EasyPaisa)
                  <br />
                  2. Transaction ID نوٹ کریں
                  <br />
                  3. یہ form جمع کریں
                  <br />
                  4. Admin 24 گھنٹوں میں منظور کریں گے
                </p>
              </div>

              <Button
                onClick={handleSubmitRequest}
                disabled={loading}
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
              >
                {loading ? "جمع ہو رہا ہے..." : "Request جمع کریں"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
