import { type ScamReport, type InsertScamReport, type Dispute, type InsertDispute } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Scam Reports
  getScamReportByPhoneNumber(phoneNumber: string): Promise<ScamReport | undefined>;
  createScamReport(report: InsertScamReport): Promise<ScamReport>;
  getAllScamReports(): Promise<ScamReport[]>;
  getRecentScamReports(limit?: number): Promise<ScamReport[]>;
  incrementReportCount(phoneNumber: string): Promise<ScamReport | undefined>;
  updateScamReportVerification(id: string, isVerified: boolean): Promise<ScamReport | undefined>;
  
  // Disputes
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  getDisputesByReportId(scamReportId: string): Promise<Dispute[]>;
  
  // Stats
  getTotalScamReports(): Promise<number>;
  getTodayScamReports(): Promise<number>;
  getCommunitySize(): Promise<number>;
}

export class MemStorage implements IStorage {
  private scamReports: Map<string, ScamReport>;
  private disputes: Map<string, Dispute>;
  private phoneNumberIndex: Map<string, string>; // phoneNumber -> reportId

  constructor() {
    this.scamReports = new Map();
    this.disputes = new Map();
    this.phoneNumberIndex = new Map();
  }

  async getScamReportByPhoneNumber(phoneNumber: string): Promise<ScamReport | undefined> {
    const reportId = this.phoneNumberIndex.get(phoneNumber);
    if (!reportId) return undefined;
    return this.scamReports.get(reportId);
  }

  async createScamReport(insertReport: InsertScamReport): Promise<ScamReport> {
    const id = randomUUID();
    const now = new Date();
    
    const report: ScamReport = {
      ...insertReport,
      id,
      callType: insertReport.callType || null,
      frequency: insertReport.frequency || null,
      isVerified: false,
      reportCount: 1,
      createdAt: now,
      updatedAt: now,
    };
    
    this.scamReports.set(id, report);
    this.phoneNumberIndex.set(insertReport.phoneNumber, id);
    
    return report;
  }

  async getAllScamReports(): Promise<ScamReport[]> {
    return Array.from(this.scamReports.values()).sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async getRecentScamReports(limit = 10): Promise<ScamReport[]> {
    const allReports = await this.getAllScamReports();
    return allReports.slice(0, limit);
  }

  async incrementReportCount(phoneNumber: string): Promise<ScamReport | undefined> {
    const reportId = this.phoneNumberIndex.get(phoneNumber);
    if (!reportId) return undefined;
    
    const report = this.scamReports.get(reportId);
    if (!report) return undefined;
    
    const updatedReport: ScamReport = {
      ...report,
      reportCount: (report.reportCount || 1) + 1,
      updatedAt: new Date(),
    };
    
    this.scamReports.set(reportId, updatedReport);
    return updatedReport;
  }

  async updateScamReportVerification(id: string, isVerified: boolean): Promise<ScamReport | undefined> {
    const report = this.scamReports.get(id);
    if (!report) return undefined;
    
    const updatedReport: ScamReport = {
      ...report,
      isVerified,
      updatedAt: new Date(),
    };
    
    this.scamReports.set(id, updatedReport);
    return updatedReport;
  }

  async createDispute(insertDispute: InsertDispute): Promise<Dispute> {
    const id = randomUUID();
    const dispute: Dispute = {
      ...insertDispute,
      id,
      verificationInfo: insertDispute.verificationInfo || null,
      createdAt: new Date(),
    };
    
    this.disputes.set(id, dispute);
    return dispute;
  }

  async getDisputesByReportId(scamReportId: string): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).filter(
      dispute => dispute.scamReportId === scamReportId
    );
  }

  async getTotalScamReports(): Promise<number> {
    return this.scamReports.size;
  }

  async getTodayScamReports(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.scamReports.values()).filter(
      report => report.createdAt! >= today
    ).length;
  }

  async getCommunitySize(): Promise<number> {
    // Simulate community size based on total reports
    const totalReports = await this.getTotalScamReports();
    return Math.floor(totalReports * 0.3) + 1000; // Rough estimate of unique reporters
  }
}

export const storage = new MemStorage();
