import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const JOIN_CODE = "2026";
const ADMIN_PASSWORD = "10004";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  shark: router({
    signup: publicProcedure
      .input(z.object({
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
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
  console.error("❌ DATABASE_URL 없음 또는 DB 연결 실패");
  throw new Error("현재 서버 설정 문제로 회원가입이 불가능합니다. 관리자에게 문의하세요.");
}

        if (input.joinCode !== JOIN_CODE) {
          throw new Error("가입 코드는 2026만 가능합니다.");
        }

        if (!input.recentSite?.trim()) {
          throw new Error("최근 이용중인 사이트를 입력해주세요.");
        }

        const existing = await db.select().from(users).where(eq(users.userId, input.userId)).limit(1);
        if (existing.length > 0) {
          throw new Error("이미 존재하는 아이디입니다.");
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

        return { success: true, message: "회원가입이 완료되었습니다!" };
      }),

    login: publicProcedure
      .input(z.object({
        userId: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
  console.error("❌ DATABASE_URL 없음 또는 DB 연결 실패");
  throw new Error("현재 서버 설정 문제로 회원가입이 불가능합니다. 관리자에게 문의하세요.");
}

        const userList = await db.select().from(users).where(eq(users.userId, input.userId)).limit(1);
        const user = userList[0];

        if (!user || user.password !== input.password) {
          throw new Error("아이디 또는 비밀번호가 틀립니다.");
        }

        return { success: true, message: "가입 승인 대기중입니다.", status: "pending" };
      }),

    getUsers: publicProcedure
      .input(z.object({
        adminPassword: z.string(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) {
  console.error("❌ DATABASE_URL 없음 또는 DB 연결 실패");
  throw new Error("현재 서버 설정 문제로 회원가입이 불가능합니다. 관리자에게 문의하세요.");
}

        if (input.adminPassword !== ADMIN_PASSWORD) {
          throw new Error("관리자 비밀번호가 올바르지 않습니다.");
        }

        const allUsers = await (db as any).select().from(users);
        return allUsers.map((u: typeof users.$inferSelect) => ({
          id: u.id,
          userId: u.userId,
          password: u.password,
          nickname: u.nickname,
          name: u.name,
          bank: u.bank,
          account: u.account,
          exchangePw: u.exchangePw,
          phone: u.phone,
          recentSite: u.recentSite,
          status: u.status,
          createdAt: u.createdAt,
        }));
      }),
  }),
});

export type AppRouter = typeof appRouter;
