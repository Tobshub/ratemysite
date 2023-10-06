import { pino } from "pino";
import { env } from "@/env.mjs";

export const logger = pino({
  transport:
    env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
});
