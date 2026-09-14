import { int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const esgSubmissions = mysqlTable("esgSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  schoolName: varchar("schoolName", { length: 255 }).notNull(),
  reportYear: varchar("reportYear", { length: 32 }).notNull(),
  profileData: json("profileData").$type<Record<string, unknown>>().notNull(),
  environmentData: json("environmentData").$type<Record<string, unknown> | null>(),
  socialData: json("socialData").$type<Record<string, unknown> | null>(),
  governanceData: json("governanceData").$type<Record<string, unknown> | null>(),
  status: mysqlEnum("status", ["draft", "submitted", "reviewing", "responded"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  reviewNote: text("reviewNote"),
  reportFileName: varchar("reportFileName", { length: 255 }),
  reportFileUrl: text("reportFileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("esg_submission_owner_year_unique").on(table.ownerId, table.reportYear)]);

export type EsgSubmission = typeof esgSubmissions.$inferSelect;
