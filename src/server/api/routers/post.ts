import { createTRPCRouter, privateProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PostFlags } from "../tdb";

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

      const posts = [];
      for (const post of res.data) {
        const user = await ctx.db.findUnique("user", {
          post_id: post.user_id,
        });

        if (!user.data || user.status !== 200) {
          // for some reason I don't want to error on 404
          if (user.status === 404) {
            ctx.log.error(user, "Could not find post author");
          } else {
            ctx.log.error(user, "Error fetching post author");
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong!",
            });
          }
        }

        posts.push({
          title: post.title,
          content: post.content,
          flags: post.flags,
          pictures: post.pictures,
          reply_id: post.reply_id,
          created_at: post.created_at,
          author: {
            name: user.data.name,
            display_picture: user.data.display_picture,
          },
        });
      }

      return posts;
    }),
  // TODO: fix to include replies
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

    const post_author = await ctx.db.findUnique("user", {
      post_id: res.data.user_id,
    });

    if (post_author.status !== 200 || !post_author.data) {
      ctx.log.error(post_author, "Error fetching post auther");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong!",
      });
    }

    return {
      title: res.data.title,
      content: res.data.content,
      flags: res.data.flags,
      pictures: res.data.pictures,
      reply_id: res.data.reply_id,
      created_at: res.data.created_at,
      author: {
        name: post_author.data.name,
        display_picture: post_author.data.display_picture,
      },
    };
  }),
  new: privateProcedure
    .input(
      z.object({
        content: z.string().min(1),
        title: z.string().min(1),
        flags: z.string().array(),
        pictures: z.string().array(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const reply_id = crypto.randomUUID();
      const res = await ctx.db.create("post", {
        user_id: ctx.auth.post_id,
        title: input.title,
        content: input.content,
        flags: input.flags as PostFlags[],
        pictures: input.pictures,
        reply_id,
      });

      if (!res.data || res.status !== 201) {
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
  reply: privateProcedure
    .input(
      z.object({
        parent_id: z.string().optional(),
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

      if (!res.data || res.status !== 201) {
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
