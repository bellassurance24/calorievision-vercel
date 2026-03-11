import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AnalyticsSectionProps {
  title: string;
  children: React.ReactNode;
  onExport?: () => void;
  loading?: boolean;
}

export const AnalyticsSection = ({
  title,
  children,
  onExport,
  loading = false,
}: AnalyticsSectionProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
