import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@/env.mjs";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
        }
      : undefined,
  maxBodySize: 1024 * 1024 * 5, // 5 MB
});

export const config = {
  api: {
    bodyParser: { sizeLimit: "5mb" },
  },
};
