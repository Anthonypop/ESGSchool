import { describe, expect, it } from "vitest";
import { LOCAL_SESSION_COOKIE, hashPassword, normaliseEmail, readLocalSessionUserId, setLocalSession, verifyPassword } from "./localAuth";

describe("學校自設帳戶密碼安全", () => {
  it("會雜湊密碼而不保存明文，並可驗證正確密碼", async () => {
    const hash = await hashPassword("secure-school-passphrase");
    expect(hash).not.toContain("secure-school-passphrase");
    await expect(verifyPassword("secure-school-passphrase", hash)).resolves.toBe(true);
    await expect(verifyPassword("incorrect-password", hash)).resolves.toBe(false);
  });
  it("會以一致方式正規化帳戶電郵", () => {
    expect(normaliseEmail(" School@Example.EDU.HK ")).toBe("school@example.edu.hk");
  });
  it("會簽發並驗證 HTTP-only 工作階段 Cookie", async () => {
    let cookieValue = "";
    const request = { protocol: "https", headers: {} } as any;
    const response = { cookie: (name: string, value: string) => { if (name === LOCAL_SESSION_COOKIE) cookieValue = value; } } as any;
    await setLocalSession(request, response, 42);
    await expect(readLocalSessionUserId({ protocol: "https", headers: { cookie: `${LOCAL_SESSION_COOKIE}=${cookieValue}` } } as any)).resolves.toBe(42);
  });
});
