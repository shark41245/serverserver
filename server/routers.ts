
import { router, publicProcedure } from "./trpc.js";
import { z } from "zod";
import { createUser, findUser, getAllUsers } from "./db.js";

const ADMIN_PASSWORD = "10004";

export const appRouter = router({
  shark: router({
    signup: publicProcedure
      .input(z.object({
        userId: z.string(),
        password: z.string()
      }))
      .mutation(async ({ input }) => {
        await createUser(input);
        return { success: true };
      }),

    login: publicProcedure
      .input(z.object({
        userId: z.string(),
        password: z.string()
      }))
      .mutation(async ({ input }) => {
        const user = await findUser(input.userId);

        if (!user || user.password !== input.password) {
          throw new Error("로그인 실패");
        }

        return { success: true };
      }),

    getUsers: publicProcedure
      .input(z.object({
        adminPassword: z.string()
      }))
      .query(async ({ input }) => {
        if (input.adminPassword !== ADMIN_PASSWORD) {
          throw new Error("관리자 비밀번호 틀림");
        }

        return await getAllUsers();
      })
  })
});
