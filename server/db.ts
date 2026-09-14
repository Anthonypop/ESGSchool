import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { EsgSubmission, InsertUser, esgSubmissions, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  return (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
}

export async function createLocalSchoolUser(input: { schoolName: string; email: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  const openId = `local:${crypto.randomUUID()}`;
  await db.insert(users).values({ openId, name: input.schoolName, email: input.email, passwordHash: input.passwordHash, loginMethod: "school-password", role: "user", lastSignedIn: new Date() });
  return getUserByEmail(input.email);
}

export async function touchLocalUserSignIn(id: number) {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export type SubmissionSection = "environment" | "social" | "governance";
export type SubmissionProfile = { schoolName: string; [key: string]: unknown };

export async function getSubmissionByOwnerAndYear(ownerId: number, reportYear: string) {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  const result = await db.select().from(esgSubmissions).where(and(eq(esgSubmissions.ownerId, ownerId), eq(esgSubmissions.reportYear, reportYear))).limit(1);
  return result[0];
}

export async function saveSubmissionSection(ownerId: number, reportYear: string, profile: SubmissionProfile, section: SubmissionSection, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  const existing = await getSubmissionByOwnerAndYear(ownerId, reportYear);
  const sectionField = section === "environment" ? "environmentData" : section === "social" ? "socialData" : "governanceData";
  if (existing) {
    if (existing.status !== "draft") throw new Error("此年度資料已正式提交，不能再由學校帳戶修改。");
    await db.update(esgSubmissions).set({ schoolName: profile.schoolName, profileData: profile, [sectionField]: data, updatedAt: new Date() } as any).where(eq(esgSubmissions.id, existing.id));
    return getSubmissionByOwnerAndYear(ownerId, reportYear);
  }
  await db.insert(esgSubmissions).values({ ownerId, reportYear, schoolName: profile.schoolName, profileData: profile, [sectionField]: data } as any);
  return getSubmissionByOwnerAndYear(ownerId, reportYear);
}

export async function listSubmissionsForOwner(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  return db.select().from(esgSubmissions).where(eq(esgSubmissions.ownerId, ownerId)).orderBy(desc(esgSubmissions.updatedAt));
}

export async function submitEsgSubmission(ownerId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  const result = await db.select().from(esgSubmissions).where(and(eq(esgSubmissions.id, id), eq(esgSubmissions.ownerId, ownerId))).limit(1);
  if (!result[0]) return undefined;
  await db.update(esgSubmissions).set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() }).where(eq(esgSubmissions.id, id));
  return (await db.select().from(esgSubmissions).where(eq(esgSubmissions.id, id)).limit(1))[0];
}

export async function listSubmissionsForAdmin() {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  return db.select().from(esgSubmissions).orderBy(desc(esgSubmissions.updatedAt));
}

export async function getSubmissionForAdmin(id: number): Promise<EsgSubmission | undefined> {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  return (await db.select().from(esgSubmissions).where(eq(esgSubmissions.id, id)).limit(1))[0];
}

export async function updateSubmissionReview(id: number, review: { status: "reviewing" | "responded"; reviewNote: string; reportFileName?: string; reportFileUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("資料庫暫時未能連線。");
  await db.update(esgSubmissions).set({ ...review, updatedAt: new Date() }).where(eq(esgSubmissions.id, id));
  return getSubmissionForAdmin(id);
}
