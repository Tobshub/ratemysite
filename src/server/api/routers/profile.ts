import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Encrypt } from "../auth";

export const ProfileRouter = createTRPCRouter({
  get: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const user = await ctx.db.findUnique("user", { name: input });

    if (!user.data || user.status !== 200) {
      if (user.status === 400) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Something went wrong!",
      });
    }

    const user_posts = await ctx.db.findMany("post", {
      user_id: user.data.post_id,
    });

    if (user_posts.status !== 200 || !user_posts.data) {
      user_posts.data = [];
    }

    const public_post_data = user_posts.data.map((post) => ({
      title: post.title,
      content: post.content,
      pictures: post.pictures,
      reply_id: post.reply_id,
      created_at: post.created_at,
    }));

    if (ctx.auth.post_id === user.data.post_id) {
      return {
        name: user.data.name,
        email: user.data.email,
        level: user.data.level,
        bio: user.data.bio,
        DOB: user.data.DOB,
        created_at: user.data.created_at,
        display_picture: user.data.display_picture,
        posts: public_post_data,
      };
    }

    return {
      name: user.data.name,
      level: user.data.level,
      bio: user.data.bio,
      DOB: user.data.DOB,
      created_at: user.data.created_at,
      display_picture: user.data.display_picture,
      posts: public_post_data,
    };
  }),
  edit: privateProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        bio: z.string().optional(),
        DOB: z.string().optional(),
        display_picture: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.db.updateUnique(
        "user",
        {
          post_id: ctx.auth.post_id,
        },
        {
          name: input.name,
          email: input.email,
          bio: input.bio,
          DOB: input.DOB ? new Date(input.DOB) : undefined,
          display_picture: input.display_picture,
        }
      );

      if (!res.data || res.status !== 200) {
        switch (res.status) {
          case 400:
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User profile not found",
            });
          case 409:
            throw new TRPCError({
              code: "CONFLICT",
              // TODO: make a way to handle this on a per field basis
              message: "Cannot make that your info",
            });
          default:
            ctx.log.error(res, "Failed to update user");
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong!",
            });
        }
      }

      return {
        name: res.data.name,
        email: res.data.email,
        level: res.data.level,
        bio: res.data.bio,
        DOB: res.data.DOB,
        created_at: res.data.created_at,
        display_picture: res.data.display_picture,
      };
    }),
  // TODO: use email to change password
  changePassword: privateProcedure
    .input(z.object({ oldPassword: z.string(), newPassword: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.db.findUnique("user", {
        post_id: ctx.auth.post_id,
      });

      if (!res.data || res.status !== 200) {
        if (res.status === 400) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User profile not found",
          });
        }

        ctx.log.error(res, "Tried to change password for unknown user");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }

      if (!Encrypt.compare(input.oldPassword, res.data.password)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect password",
        });
      }

      return true;
    }),
  // TODO: verfying profile email
  // consider brevo for this (maybe sendgrid)
});
