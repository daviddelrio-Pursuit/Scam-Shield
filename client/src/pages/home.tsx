import { PhoneLookup } from "@/components/phone-lookup";
import { StatsDisplay } from "@/components/stats-display";
import { RecentReports } from "@/components/recent-reports";
import { ReportScamModal } from "@/components/report-scam-modal";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">ScamShield</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Lookup Section */}
        <PhoneLookup />

        {/* Stats Dashboard */}
        <StatsDisplay />

        {/* Report New Scam Button */}
        <div className="flex justify-center">
          <ReportScamModal />
        </div>

        {/* Recently Reported Numbers */}
        <RecentReports />
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-16 sm:hidden"></div>
    </div>
  );
}
