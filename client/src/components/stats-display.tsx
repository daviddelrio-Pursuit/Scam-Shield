import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  totalScams: number;
  todayReports: number;
  communitySize: number;
}

export function StatsDisplay() {
  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-6 text-center shadow-sm">
            <Skeleton className="h-8 w-8 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto mb-2" />
            <Skeleton className="h-8 w-16 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center shadow-sm">
        <p className="text-muted-foreground">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-card rounded-lg border border-border p-6 text-center shadow-sm" data-testid="stat-total-scams">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">Total Scams</h3>
        <p className="text-3xl font-bold text-foreground">{stats.totalScams.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6 text-center shadow-sm" data-testid="stat-today-reports">
        <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">Today's Reports</h3>
        <p className="text-3xl font-bold text-foreground">{stats.todayReports.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6 text-center shadow-sm sm:col-span-2 lg:col-span-1" data-testid="stat-community-size">
        <Users className="h-8 w-8 text-accent-foreground mx-auto mb-2" />
        <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">Community Size</h3>
        <p className="text-3xl font-bold text-foreground">{stats.communitySize.toLocaleString()}</p>
      </div>
    </div>
  );
}
