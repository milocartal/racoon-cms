import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

const settingSchema = z.object({
  siteName: z.string(),
  slogan: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  logoId: z.string().nullable().optional(),
  // Logo is a relation, typically handled separately
  primaryColor: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
  backgroundColor: z.string().nullable().optional(),
  textColor: z.string().nullable().optional(),
  defaultSeoTitle: z.string().nullable().optional(),
  defaultSeoDesc: z.string().nullable().optional(),
});

export const settingsRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    return await db.setting.findFirstOrThrow().catch((error) => {
      console.error("Error fetching settings:", error);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Could not fetch app settings",
      });
    });
  }),

  upsert: protectedProcedure
    .input(settingSchema)
    .mutation(async ({ input }) => {
      return await db.setting.upsert({
        where: { id: "SETTINGS" },
        create: { id: "SETTINGS", ...input },
        update: input,
      });
    }),
});
