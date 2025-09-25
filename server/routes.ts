import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScamReportSchema, insertDisputeSchema } from "@shared/schema";
import { z } from "zod";

// Utility function to clean phone numbers for consistent storage/lookup
function cleanPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Phone number lookup
  app.get("/api/lookup/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const cleanedNumber = cleanPhoneNumber(phoneNumber);
      const report = await storage.getScamReportByPhoneNumber(cleanedNumber);
      
      if (!report) {
        return res.json({ found: false });
      }
      
      res.json({ 
        found: true, 
        report: {
          ...report,
          createdAt: report.createdAt?.toISOString(),
          updatedAt: report.updatedAt?.toISOString(),
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to lookup phone number" });
    }
  });

  // Report new scam
  app.post("/api/reports", async (req, res) => {
    try {
      const validatedData = insertScamReportSchema.parse(req.body);
      
      // Clean phone number for consistent storage
      const cleanedNumber = cleanPhoneNumber(validatedData.phoneNumber);
      const cleanedData = { ...validatedData, phoneNumber: cleanedNumber };
      
      // Check if number already exists
      const existingReport = await storage.getScamReportByPhoneNumber(cleanedNumber);
      
      if (existingReport) {
        // Increment report count
        const updatedReport = await storage.incrementReportCount(cleanedNumber);
        return res.json({ 
          report: {
            ...updatedReport!,
            createdAt: updatedReport!.createdAt?.toISOString(),
            updatedAt: updatedReport!.updatedAt?.toISOString(),
          },
          message: "Report count updated" 
        });
      }
      
      const report = await storage.createScamReport(cleanedData);
      res.status(201).json({ 
        report: {
          ...report,
          createdAt: report.createdAt?.toISOString(),
          updatedAt: report.updatedAt?.toISOString(),
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Get recent reports
  app.get("/api/reports/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const reports = await storage.getRecentScamReports(limit);
      
      const formattedReports = reports.map(report => ({
        ...report,
        createdAt: report.createdAt?.toISOString(),
        updatedAt: report.updatedAt?.toISOString(),
      }));
      
      res.json({ reports: formattedReports });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent reports" });
    }
  });

  // Get all reports with search/filter
  app.get("/api/reports", async (req, res) => {
    try {
      const { search, category } = req.query;
      let reports = await storage.getAllScamReports();
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        reports = reports.filter(report => 
          report.phoneNumber.includes(searchTerm) ||
          report.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (category) {
        reports = reports.filter(report => report.category === category);
      }
      
      const formattedReports = reports.map(report => ({
        ...report,
        createdAt: report.createdAt?.toISOString(),
        updatedAt: report.updatedAt?.toISOString(),
      }));
      
      res.json({ reports: formattedReports });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Create dispute
  app.post("/api/disputes", async (req, res) => {
    try {
      const validatedData = insertDisputeSchema.parse(req.body);
      const dispute = await storage.createDispute(validatedData);
      
      res.status(201).json({ 
        dispute: {
          ...dispute,
          createdAt: dispute.createdAt?.toISOString(),
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });

  // Get statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const [totalScams, todayReports, communitySize] = await Promise.all([
        storage.getTotalScamReports(),
        storage.getTodayScamReports(),
        storage.getCommunitySize(),
      ]);
      
      res.json({
        totalScams,
        todayReports,
        communitySize,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Update report verification status
  app.patch("/api/reports/:id/verify", async (req, res) => {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;
      
      const updatedReport = await storage.updateScamReportVerification(id, isVerified);
      
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json({ 
        report: {
          ...updatedReport,
          createdAt: updatedReport.createdAt?.toISOString(),
          updatedAt: updatedReport.updatedAt?.toISOString(),
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update verification status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
