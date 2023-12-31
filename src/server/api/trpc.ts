import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "./tdb";
import { AppToken } from "./auth";
import { logger } from "@/server/logger";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = { token: string | undefined };

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return { db: db, auth: { token: _opts.token }, log: logger };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  const token = _opts.req.headers.authorization;
  return createInnerTRPCContext({
    token: token === "undefined" ? undefined : token,
  });
};

export type TRPCContext = ReturnType<typeof createTRPCContext>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const openProcedure = t.procedure;

const optionalAuth = t.middleware(({ next, ctx }) => {
  if (ctx.auth.token) {
    try {
      const post_id = AppToken.validate(ctx.auth.token);
      return next({ ctx: { auth: { ...ctx.auth, post_id } } });
    } catch (e) {
      ctx.log.error(e, "invalid token, but allowed");
    }
  }
  return next({ ctx: { auth: { ...ctx.auth } } });
});

export const publicProcedure = t.procedure.use(optionalAuth);

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please Login or Sign Up",
    });
  }

  try {
    const post_id = AppToken.validate(ctx.auth.token);
    return next({ ctx: { auth: { ...ctx.auth, post_id } } });
  } catch (e) {
    ctx.log.error(e, "invalid token");
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please Login or Sign Up",
    });
  }
});

export const privateProcedure = t.procedure.use(isAuthed);
