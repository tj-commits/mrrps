import { createTRPCRouter } from "~/server/api/trpc";
import { mrrpRouter } from "~/server/api/routers/mrrp";
import { profileRouter } from "./routers/profile";
import { commentRouter } from './routers/comment'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  mrrp: mrrpRouter,
  profile: profileRouter,
  comment: commentRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
