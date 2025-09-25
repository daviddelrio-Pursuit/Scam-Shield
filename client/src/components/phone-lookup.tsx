import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, Clock, Users, Flag } from "lucide-react";
import { formatPhoneNumber, isValidPhoneNumber, cleanPhoneNumber } from "@/lib/phone-utils";
import type { ScamReport } from "@shared/schema";

interface LookupResponse {
  found: boolean;
  report?: ScamReport;
}

export function PhoneLookup() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchedNumber, setSearchedNumber] = useState("");

  const { data: lookupResult, isLoading, error } = useQuery<LookupResponse>({
    queryKey: ["/api/lookup", searchedNumber],
    enabled: !!searchedNumber,
  });

  const handleLookup = () => {
    const cleaned = cleanPhoneNumber(phoneNumber);
    if (isValidPhoneNumber(phoneNumber)) {
      setSearchedNumber(cleaned);
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  };

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

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Quick Phone Number Lookup</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="tel"
              placeholder="Enter phone number (e.g., +1 555-123-4567)"
              value={phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              className="text-base font-mono tracking-wide"
              data-testid="input-phone-lookup"
            />
          </div>
          <Button 
            onClick={handleLookup}
            disabled={!isValidPhoneNumber(phoneNumber) || isLoading}
            className="px-6"
            data-testid="button-lookup"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "Checking..." : "Check Number"}
          </Button>
        </div>
        
        {/* Lookup Result */}
        {searchedNumber && !isLoading && (
          <div className="space-y-3">
            {lookupResult?.found ? (
              <div className="p-4 border border-destructive bg-destructive/5 rounded-md" data-testid="result-scam-found">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-destructive">⚠️ SCAM ALERT</h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-mono font-medium">{formatPhoneNumber(searchedNumber)}</span> has been reported as a scam number
                    </p>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Category:</span>
                        <Badge variant="destructive" className="text-xs">
                          {categoryLabels[lookupResult.report?.category || ''] || lookupResult.report?.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {lookupResult.report?.reportCount} reports
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lookupResult.report?.updatedAt ? new Date(lookupResult.report.updatedAt as unknown as string).toLocaleDateString() : 'Unknown'}
                        </span>
                        {lookupResult.report?.isVerified && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Flag className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-green-300 bg-green-50 rounded-md" data-testid="result-clean">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">No Reports Found</h3>
                    <p className="text-sm text-green-700">
                      <span className="font-mono font-medium">{formatPhoneNumber(searchedNumber)}</span> has not been reported as a scam number.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md" data-testid="result-error">
            <p className="text-sm text-red-700">
              Failed to check phone number. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
