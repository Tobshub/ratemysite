import { createTRPCRouter } from "@/server/api/trpc";
import { AuthRouter } from "./routers/auth";
import { ProfileRouter } from "./routers/profile";
import { PostRouter } from "./routers/post";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: AuthRouter,
  profile: ProfileRouter,
  post: PostRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
