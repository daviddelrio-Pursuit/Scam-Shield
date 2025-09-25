import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPhoneNumber } from "@/lib/phone-utils";
import type { ScamReport } from "@shared/schema";

interface RecentReportsData {
  reports: ScamReport[];
}

export function RecentReports() {
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery<RecentReportsData>({
    queryKey: ["/api/reports/recent"],
    refetchInterval: 60000, // Refresh every minute
  });

  const categoryLabels: Record<string, string> = {
    "debt-collection": "Debt Collection",
    "utilities": "Utilities", 
    "money-scams": "Money Scams",
    "tech-support": "Tech Support",
    "fake-prizes": "Fake Prizes/Lottery",
    "irs-tax": "IRS/Tax Scams",
    "charity": "Charity Scams",
    "insurance": "Insurance",
    "credit-card": "Credit Card Offers",
    "loan-offers": "Loan Offers",
    "investment": "Investment Scams",
    "romance": "Romance Scams",
    "phishing": "Phishing",
    "robocalls": "Robocalls",
    "political": "Political Calls",
    "survey": "Survey Scams",
    "vacation": "Vacation/Timeshare",
    "health-medical": "Health/Medical",
    "employment": "Employment Scams",
    "business-opportunity": "Business Opportunity Scams",
  };

  const toggleExpanded = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Recently Reported Numbers</h2>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Recently Reported Numbers</h2>
        </div>
        <p className="text-muted-foreground text-center py-8">
          Failed to load recent reports. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Recently Reported Numbers</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="button-view-all">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {data.reports.length === 0 ? (
          <p className="text-muted-foreground text-center py-8" data-testid="text-no-reports">
            No recent reports available.
          </p>
        ) : (
          data.reports.map((report) => (
            <div 
              key={report.id} 
              className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              data-testid={`card-report-${report.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-mono font-semibold text-foreground" data-testid={`text-phone-${report.id}`}>
                      {formatPhoneNumber(report.phoneNumber)}
                    </span>
                    <Badge variant="destructive" className="text-xs" data-testid={`badge-category-${report.id}`}>
                      {categoryLabels[report.category] || report.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2" data-testid={`text-description-${report.id}`}>
                    {report.description}
                  </p>
                  
                  {expandedReports.has(report.id) && (
                    <div className="mt-3 space-y-2 text-sm">
                      {report.callType && (
                        <p><span className="font-medium">Call Type:</span> {report.callType}</p>
                      )}
                      {report.frequency && (
                        <p><span className="font-medium">Frequency:</span> {report.frequency}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {report.reportCount} reports
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(report.updatedAt! as unknown as string)}
                    </span>
                    <span className={`flex items-center gap-1 ${report.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                      <Flag className="h-3 w-3" />
                      {report.isVerified ? 'Verified' : 'Under Review'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(report.id)}
                  className="p-1 hover:bg-muted rounded"
                  data-testid={`button-expand-${report.id}`}
                >
                  {expandedReports.has(report.id) ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
