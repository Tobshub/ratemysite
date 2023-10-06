import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const PostRouter = createTRPCRouter({
  feed: publicProcedure
    .input(z.object({ cursor: z.string().nullish() }))
    .query(async ({ input: _, ctx }) => {
      // TODO: use take option (coming soon)
      const res = await ctx.db.findMany("post", {});

      if (res.status !== 200 || !res.data) {
        ctx.log.error(res, "Error fetching feed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }

      return res.data.map((post) => ({
        title: post.title,
        content: post.content,
        pictures: post.pictures,
        reply_id: post.reply_id,
        created_at: post.created_at,
      }));
    }),
  get: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const res = await ctx.db.findUnique("post", { reply_id: input });

    if (res.status !== 200 || !res.data) {
      if (res.status === 400) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find post",
        });
      }

      ctx.log.error(res, "Error fetching post");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong!",
      });
    }

    return {
      title: res.data.title,
      content: res.data.content,
      pictures: res.data.pictures,
      reply_id: res.data.reply_id,
      created_at: res.data.created_at,
    };
  }),
  new: privateProcedure
    .input(
      z.object({
        content: z.string().min(1),
        title: z.string().min(1),
        pictures: z.string().array(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const reply_id = crypto.randomUUID();
      const res = await ctx.db.create("post", {
        user_id: ctx.auth.post_id,
        title: input.title,
        content: input.content,
        pictures: input.pictures,
        reply_id,
      });

      if (!res.data || res.status !== 200) {
        ctx.log.error(res, "Error creating post");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }

      return {
        title: res.data.title,
        content: res.data.content,
        pictures: res.data.pictures,
        reply_id: res.data.reply_id,
        created_at: res.data.created_at,
      };
    }),
  reply: publicProcedure
    .input(
      z.object({
        parent_id: z.string(),
        post_id: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const reply_id = crypto.randomUUID();
      const res = await ctx.db.create("reply", {
        user_id: ctx.auth.post_id,
        content: input.content,
        post_id: input.post_id,
        parent_id: input.parent_id,
        reply_id,
      });

      if (!res.data || res.status !== 200) {
        ctx.log.error(res, "Error creating reply");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }

      return {
        content: res.data.content,
        post_id: res.data.post_id,
        parent_id: res.data.parent_id,
        reply_id: res.data.reply_id,
        created_at: res.data.created_at,
      };
    }),
});
