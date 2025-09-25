import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flag, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/phone-utils";
import { insertScamReportSchema, type InsertScamReport } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const categoryOptions = [
  { value: "debt-collection", label: "Debt Collection" },
  { value: "utilities", label: "Utilities" },
  { value: "money-scams", label: "Money Scams" },
  { value: "tech-support", label: "Tech Support" },
  { value: "fake-prizes", label: "Fake Prizes/Lottery" },
  { value: "irs-tax", label: "IRS/Tax Scams" },
  { value: "charity", label: "Charity Scams" },
  { value: "insurance", label: "Insurance" },
  { value: "credit-card", label: "Credit Card Offers" },
  { value: "loan-offers", label: "Loan Offers" },
  { value: "investment", label: "Investment Scams" },
  { value: "romance", label: "Romance Scams" },
  { value: "phishing", label: "Phishing" },
  { value: "robocalls", label: "Robocalls" },
  { value: "political", label: "Political Calls" },
  { value: "survey", label: "Survey Scams" },
  { value: "vacation", label: "Vacation/Timeshare" },
  { value: "health-medical", label: "Health/Medical" },
  { value: "employment", label: "Employment Scams" },
  { value: "business-opportunity", label: "Business Opportunity Scams" },
];

const callTypeOptions = [
  { value: "live", label: "Live Person" },
  { value: "robocall", label: "Robocall" },
  { value: "voicemail", label: "Left Voicemail" },
  { value: "text", label: "Text Message" },
];

const frequencyOptions = [
  { value: "once", label: "Called Once" },
  { value: "few-times", label: "Few Times" },
  { value: "daily", label: "Daily" },
  { value: "multiple-daily", label: "Multiple Times Daily" },
];

export function ReportScamModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<InsertScamReport>({
    resolver: zodResolver(insertScamReportSchema),
    defaultValues: {
      phoneNumber: "",
      category: undefined,
      description: "",
      callType: undefined,
      frequency: undefined,
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (data: InsertScamReport) => {
      return apiRequest("POST", "/api/reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Report submitted successfully",
        description: "Thank you for helping keep the community safe!",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit report",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    reportMutation.mutate(data as InsertScamReport);
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    form.setValue("phoneNumber", formatted);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="bg-destructive text-destructive-foreground px-8 py-4 text-lg shadow-lg hover:bg-destructive/90"
          data-testid="button-open-report-modal"
        >
          <Plus className="h-5 w-5 mr-2" />
          Report New Scam Number
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-report-scam">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5 text-destructive" />
            <span>Report Scam Number</span>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...field}
                      onChange={(e) => handlePhoneNumberChange(e.target.value)}
                      className="font-mono tracking-wide"
                      data-testid="input-phone-number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scam Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describe what the caller said, what they wanted, any voice messages left, etc. Be as specific as possible to help others identify this scam."
                      className="resize-none"
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Help others by being specific about the caller's tactics, claims, or requests.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="callType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-call-type">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {callTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-frequency">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={reportMutation.isPending}
                data-testid="button-submit-report"
              >
                <Flag className="h-4 w-4 mr-2" />
                {reportMutation.isPending ? "Submitting..." : "Report Scam"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
