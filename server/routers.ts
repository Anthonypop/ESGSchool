import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { esgRouter } from "./esg";
import { createLocalSchoolUser, getUserByEmail, touchLocalUserSignIn } from "./db";
import { clearLocalSession, hashPassword, normaliseEmail, setLocalSession, verifyPassword } from "./localAuth";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      clearLocalSession(ctx.req, ctx.res);
      return {
        success: true,
      } as const;
    }),
  }),
  account: router({
    register: publicProcedure.input(z.object({ schoolName: z.string().trim().min(2, "請填寫學校名稱。"), email: z.string().trim().email("請填寫有效電郵地址。"), password: z.string().min(10, "密碼至少須為 10 個字元。") })).mutation(async ({ ctx, input }) => {
      const email = normaliseEmail(input.email);
      if (await getUserByEmail(email)) throw new TRPCError({ code: "CONFLICT", message: "此電郵已註冊，請直接登入。" });
      const user = await createLocalSchoolUser({ schoolName: input.schoolName.trim(), email, passwordHash: await hashPassword(input.password) });
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "建立帳戶失敗，請稍後再試。" });
      await setLocalSession(ctx.req, ctx.res, user.id);
      return user;
    }),
    login: publicProcedure.input(z.object({ email: z.string().trim().email("請填寫有效電郵地址。"), password: z.string().min(1, "請填寫密碼。") })).mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(normaliseEmail(input.email));
      if (!user || !await verifyPassword(input.password, user.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "電郵或密碼不正確。" });
      await touchLocalUserSignIn(user.id);
      await setLocalSession(ctx.req, ctx.res, user.id);
      return user;
    }),
  }),
  esg: esgRouter,
});

export type AppRouter = typeof appRouter;
