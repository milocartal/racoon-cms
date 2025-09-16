import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";
import { mediaSchema } from "~/lib/models/Media";
import { toSlug } from "~/lib/utils";

export const mediaRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.media.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(mediaSchema)
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).createAny("media").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to create media.",
        });
      }

      const slug = toSlug(input.name);

      const media = await db.media.create({
        data: {
          ...input,
          url: input.url ?? `/media/${slug}`,
          createdById: ctx.session.user.id,
        },
      });

      return media;
    }),

  update: protectedProcedure
    .input(mediaSchema.extend({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).updateAny("media").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update media.",
        });
      }

      const media = await db.media.update({
        where: { id: input.id },
        data: {
          ...input,
        },
      });

      return media;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).deleteAny("media").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete media.",
        });
      }

      const media = await db.media.findUnique({
        where: { id: input.id },
      });

      if (!media) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media not found.",
        });
      }

      await db.media.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
