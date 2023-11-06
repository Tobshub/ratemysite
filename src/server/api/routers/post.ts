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
        reply_id,
      });

      if (!res.data || res.status !== 201) {
        ctx.log.error(res, "Error creating post");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }

      const pictures = [];
      for (const picture of input.pictures) {
        const res = await ctx.db.create("media", {
          uid: crypto.randomUUID(),
          data: picture,
        });

        if (res.status !== 201 || !res.data) {
          ctx.log.error(res, "Error uploading media");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong!",
          });
        }

        pictures.push(res.data.uid);
      }

      // set post pictures are the generated urls
      // can't do this before creating the posts because tdb will check if the pictures exist
      const update = await ctx.db.updateUnique(
        "post",
        { reply_id: res.data.reply_id },
        { pictures }
      );

      if (!update.data || update.status !== 200) {
        ctx.log.error(update, "Error updating post with pictures");
      }

      return {
        title: res.data.title,
        content: res.data.content,
        pictures: pictures,
        reply_id: res.data.reply_id,
        created_at: res.data.created_at,
      };
    }),
  reply: privateProcedure
    .input(
      z.object({
        parent_id: z.string().nullish(),
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
        up_voters: [],
        down_voters: [],
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
  getReplies: publicProcedure
    .input(
      z.object({
        post_id: z.string(),
        // default is important here because a null parent_id signifies
        // the reply is to the root post
        parent_id: z.string().nullish().default(null),
      })
    )
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.findMany("reply", input);

      if (res.status !== 200 || !res.data) {
        ctx.log.error(res, "Error fetching replies");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }

      if (!res.data.length) return [];

      const replies = [];
      for (const reply of res.data) {
        const author = await ctx.db.findUnique("user", {
          post_id: reply.user_id,
        });

        if (!author.data || author.status !== 200) {
          if (author.status === 404) {
            ctx.log.error(author, "Could not find reply author");
          } else {
            ctx.log.error(author, "Error fetching reply author");
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong!",
            });
          }
        }

        replies.push({
          content: reply.content,
          post_id: reply.post_id,
          parent_id: reply.parent_id,
          reply_id: reply.reply_id,
          user_vote: ctx.auth.post_id
            ? GetUserVote(ctx.auth.post_id, reply.up_voters, reply.down_voters)
            : 0,
          up_votes: reply.up_voters.length,
          down_votes: reply.down_voters.length,
          created_at: reply.created_at,
          author: {
            name: author.data.name,
            display_picture: author.data.display_picture,
          },
        });
      }

      return replies;
    }),
  voteOnReply: privateProcedure
    .input(z.object({ reply_id: z.string(), userVote: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const reply = await ctx.db.findUnique("reply", { reply_id: input.reply_id });

      if (!reply.data || reply.status !== 200) {
        if (reply.status === 404) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Reply no longer exists" });
        } else {
          ctx.log.error(reply, "Error fetching reply");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong!",
          });
        }
      }

      const prevVote = GetUserVote(ctx.auth.post_id, reply.data.up_voters, reply.data.down_voters);
      if (prevVote === input.userVote) {
        return {
          user_vote: prevVote,
          up_votes: reply.data.up_voters.length,
          down_votes: reply.data.down_voters.length,
        };
      }

      let newDownVoters = reply.data.down_voters;
      let newUpVoters = reply.data.up_voters;

      if (prevVote < 0) {
        newDownVoters = reply.data.down_voters.filter((voter_id) => voter_id != ctx.auth.post_id);
      } else if (prevVote > 0) {
        newUpVoters = reply.data.up_voters.filter((voter_id) => voter_id != ctx.auth.post_id);
      }

      // Consideration:
      // what happens if after this initial reply data has been fetched
      // the reply is mutated (i.e. another voteOnReply request is completed)
      // other start -> this start -> other finish -> this finish
      // that would mean "newDownVoters" and "newUpVoters" may contain stale data
      // and using either in the request might not be the best idea
      let res;

      if (input.userVote > 0) {
        // upvote
        res = await ctx.db.updateUnique(
          "reply",
          { id: reply.data.id },
          { up_voters: { push: [ctx.auth.post_id] }, down_voters: newDownVoters }
        );
      } else if (input.userVote < 0) {
        // downvote
        res = await ctx.db.updateUnique(
          "reply",
          { id: reply.data.id },
          { down_voters: { push: [ctx.auth.post_id] }, up_voters: newUpVoters }
        );
      } else {
        // no vote
        res = await ctx.db.updateUnique(
          "reply",
          { id: reply.data.id },
          { up_voters: newUpVoters, down_voters: newDownVoters }
        );
      }

      if (res.status !== 200 || !res.data) {
        ctx.log.error(res, "Error voting on reply");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }

      return {
        user_vote: GetUserVote(ctx.auth.post_id, res.data.up_voters, res.data.down_voters),
        up_votes: res.data.up_voters.length,
        down_votes: res.data.down_voters.length,
      };
    }),
});

/** 1 for upvote, -1 for downvote, 0 for no vote */
function GetUserVote(post_id: string, up_voters: string[], down_voters: string[]) {
  if (up_voters.includes(post_id)) return 1;
  if (down_voters.includes(post_id)) return -1;
  return 0;
}
