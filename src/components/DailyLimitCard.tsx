import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyLimitCardProps {
  used: number;
  limit: number;
  loading?: boolean;
}

export const DailyLimitCard = ({ used, limit, loading }: DailyLimitCardProps) => {
  const percentage = (used / limit) * 100;
  const remaining = limit - used;

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5" />
            Daily Free Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5" />
          Daily Free Videos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">آج استعمال شدہ</span>
            <span className="font-medium text-foreground">
              {used} / {limit}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {remaining === 0 ? (
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-3">
              آج کی حد ختم! HD videos بغیر watermark کے چاہیے؟
            </p>
            <Button className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow">
              <Zap className="mr-2 h-4 w-4" />
              Premium آزمائیں
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            آج {remaining} مفت video{remaining !== 1 ? "s" : ""} باقی ہیں
          </p>
        )}
      </CardContent>
    </Card>
  );
};
