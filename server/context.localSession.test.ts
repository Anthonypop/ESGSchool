import { describe, expect, it } from "vitest";
import { createContext } from "./_core/context";

describe("本地學校帳戶身分建立", () => {
  it("缺少本地 school-password 工作階段時不會接受外部登入 Cookie", async () => {
    const context = await createContext({ req: { protocol: "https", headers: { cookie: "external_oauth_session=legacy-token" } } as any, res: {} as any });
    expect(context.user).toBeNull();
  });
});
