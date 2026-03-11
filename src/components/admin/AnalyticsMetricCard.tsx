import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsMetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  loading?: boolean;
}

export const AnalyticsMetricCard = ({
  title,
  value,
  change,
  changeLabel = "vs previous period",
  icon: Icon,
  loading = false,
}: AnalyticsMetricCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <p className={cn(
                "text-xs",
                isPositive && "text-green-600",
                isNegative && "text-red-600",
                !isPositive && !isNegative && "text-muted-foreground"
              )}>
                {isPositive && "↑ "}
                {isNegative && "↓ "}
                {isPositive && "+"}
                {change.toFixed(1)}% {changeLabel}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
