import { z } from "zod";

import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";
import { pageSchema } from "~/app/_components/pages";
import type { InputJsonValue } from "@prisma/client/runtime/library";

export const pagesRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.page.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(pageSchema)
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).createAny("pages").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to create pages.",
        });
      }

      const content = JSON.parse(input.content) as InputJsonValue;

      const page = await db.page.create({
        data: {
          ...input,
          content,
        },
      });

      return page;
    }),

  update: protectedProcedure
    .input(pageSchema.extend({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).updateAny("pages").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update pages.",
        });
      }

      const content = JSON.parse(input.content) as InputJsonValue;

      const page = await db.page.update({
        where: { id: input.id },
        data: {
          ...input,
          content,
        },
      });

      return page;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).deleteAny("pages").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete pages.",
        });
      }

      const page = await db.page.findUnique({
        where: { id: input.id },
      });

      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found.",
        });
      }

      await db.page.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
