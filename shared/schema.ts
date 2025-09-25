import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scamCategories = [
  "debt-collection",
  "utilities", 
  "money-scams",
  "tech-support",
  "fake-prizes",
  "irs-tax",
  "charity",
  "insurance",
  "credit-card",
  "loan-offers",
  "investment",
  "romance",
  "phishing",
  "robocalls",
  "political",
  "survey",
  "vacation",
  "health-medical",
  "employment",
  "business-opportunity"
] as const;

export const callTypes = [
  "live",
  "robocall", 
  "voicemail",
  "text"
] as const;

export const frequencies = [
  "once",
  "few-times",
  "daily",
  "multiple-daily"
] as const;

export const scamReports = pgTable("scam_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  callType: text("call_type"),
  frequency: text("frequency"), 
  isVerified: boolean("is_verified").default(false),
  reportCount: integer("report_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const disputes = pgTable("disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scamReportId: varchar("scam_report_id").notNull(),
  description: text("description").notNull(),
  verificationInfo: text("verification_info"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScamReportSchema = createInsertSchema(scamReports).pick({
  phoneNumber: true,
  category: true,
  description: true,
  callType: true,
  frequency: true,
}).extend({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  category: z.enum(scamCategories),
  description: z.string().min(10, "Description must be at least 10 characters"),
  callType: z.enum(callTypes).optional(),
  frequency: z.enum(frequencies).optional(),
});

export const insertDisputeSchema = createInsertSchema(disputes).pick({
  scamReportId: true,
  description: true,
  verificationInfo: true,
}).extend({
  description: z.string().min(10, "Description must be at least 10 characters"),
  verificationInfo: z.string().optional(),
});

export type InsertScamReport = z.infer<typeof insertScamReportSchema>;
export type ScamReport = typeof scamReports.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;
