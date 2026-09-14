import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { SignJWT, jwtVerify } from "jose";
import { parse } from "cookie";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";
import { getSessionCookieOptions } from "./_core/cookies";

const scrypt = promisify(scryptCallback);
export const LOCAL_SESSION_COOKIE = "school_esg_session";
const SESSION_AUDIENCE = "school-esg-local-account";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

function sessionKey() {
  if (!ENV.cookieSecret) throw new Error("登入服務暫時未完成設定。");
  return new TextEncoder().encode(ENV.cookieSecret);
}

export function normaliseEmail(email: string) { return email.trim().toLowerCase(); }

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [algorithm, salt, expectedHex] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  const actual = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function setLocalSession(req: Request, res: Response, userId: number) {
  const token = await new SignJWT({ role: "school" }).setProtectedHeader({ alg: "HS256" }).setSubject(String(userId)).setAudience(SESSION_AUDIENCE).setIssuedAt().setExpirationTime("7d").sign(sessionKey());
  res.cookie(LOCAL_SESSION_COOKIE, token, { ...getSessionCookieOptions(req), maxAge: SESSION_LIFETIME_SECONDS * 1000 });
}

export function clearLocalSession(req: Request, res: Response) {
  res.clearCookie(LOCAL_SESSION_COOKIE, { ...getSessionCookieOptions(req), maxAge: -1 });
}

export async function readLocalSessionUserId(req: Request) {
  const token = parse(req.headers.cookie || "")[LOCAL_SESSION_COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { audience: SESSION_AUDIENCE });
    const id = Number(payload.sub);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch { return null; }
}
