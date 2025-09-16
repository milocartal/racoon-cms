import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { pagesRouter } from "~/server/api/routers/pages";
import { settingsRouter } from "~/server/api/routers/settings";
import { userRouter } from "~/server/api/routers/user";
import { mediaRouter } from "~/server/api/routers/media";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  media: mediaRouter,
  page: pagesRouter,
  settings: settingsRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
