import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AppToken, Encrypt } from "../auth";
import { alphaNumericString } from "@/utils/zod";

export const AuthRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        name: alphaNumericString("Username").min(5).max(25),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      input.name = input.name.toLowerCase();
      const post_id = crypto.randomUUID();
      const res = await ctx.db.create("user", {
        level: 0,
        password: Encrypt.hash(input.password),
        name: input.name,
        post_id,
      });

      if (res.status !== 201) {
        if (res.message === "Value for unique field name already exists") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already exists",
          });
        }
        ctx.log.error(res.message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }

      const token = AppToken.generate(res.data.post_id);
      return { token, name: res.data.name };
    }),
  login: publicProcedure
    .input(z.object({ name: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.db.findUnique("user", {
        name: input.name.toLowerCase(),
      });
      if (!res.data || res.status !== 200) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      if (!Encrypt.compare(input.password, res.data.password)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = AppToken.generate(res.data.post_id);
      return { token, name: res.data.name };
    }),
  checkUsernameAvailable: publicProcedure
    .input(z.string().min(5))
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.findUnique("user", {
        name: input.toLowerCase(),
      });
      if (res.status === 404) {
        return true;
      }

      return false;
    }),
});
