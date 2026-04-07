import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { getDb } from "./db.js";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";

const JOIN_CODE = "2026";
const ADMIN_PASSWORD = "10004";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
  }),

  shark: router({
    signup: publicProcedure
      .input(
        z.object({
          userId: z.string(),
          password: z.string(),
          nickname: z.string(),
          name: z.string(),
          bank: z.string(),
          account: z.string(),
          exchangePw: z.string(),
          phone: z.string(),
          joinCode: z.string(),
          recentSite: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");

        if (input.joinCode !== JOIN_CODE) {
          throw new Error("가입 코드 오류");
        }

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.userId, input.userId))
          .limit(1);

        if (existing.length > 0) {
          throw new Error("이미 존재하는 아이디");
        }

        await db.insert(users).values({
          userId: input.userId,
          password: input.password,
          nickname: input.nickname,
          name: input.name,
          bank: input.bank,
          account: input.account,
          exchangePw: input.exchangePw,
          phone: input.phone,
          recentSite: input.recentSite,
          status: "pending",
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
