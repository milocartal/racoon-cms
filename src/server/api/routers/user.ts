import { AuditAction, AuditTargetType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { argon2id, hash } from "argon2";

import { z } from "zod";
import { createUserSchema } from "~/lib/models/User";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

import { can } from "~/utils/accesscontrol";

export const userRouter = createTRPCRouter({
  //Permet de recuperer l'utilisateur actuel
  getActual: protectedProcedure.query(async ({ ctx }) => {
    return await db.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
    });
  }),

  //Permet de creer un utilisateur simple
  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).createAny("user").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unsufficient privileges",
          cause: "User cannot do this action based his current role",
        });
      }

      if (
        input.role === "ADMIN" &&
        !can(ctx.session).createAny("admin").granted
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unsufficient privileges",
          cause: "User cannot do this action based his current role",
        });
      }

      const auditActor = await db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!auditActor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Audit Actor not found, cannot create user",
        });
      }

      const temp = await db.user.findUnique({
        where: { email: input.email },
      });
      if (temp) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hashed = await hash(input.password, {
        type: argon2id,
      });

      const user = await db.user
        .create({
          data: {
            name: input.name,
            email: input.email,
            passwordHash: hashed,
          },
        })
        .catch((error) => {
          console.error("Error creating user:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      await db.auditLog.create({
        data: {
          action: AuditAction.CREATE,
          actorId: auditActor.id,
          targetId: user.id,
          targetType: AuditTargetType.USER,
        },
      });

      return user;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).updateAny("user").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unsufficient privileges",
          cause: "User cannot do this action based his current role",
        });
      }

      const temp = await db.user.findUnique({
        where: { id: input.id },
      });

      if (!temp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }

      if (
        temp.role !== "ADMIN" &&
        !can(ctx.session).updateOwn("user").granted
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unsufficient privileges",
          cause: "User cannot do this action based his current role",
        });
      }

      const auditActor = await db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!auditActor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Audit Actor not found, cannot update user",
        });
      }

      const updatedUser = await db.user
        .update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            image: input.image,
          },
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user",
          });
        });

      if (!updatedUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }

      await db.auditLog.create({
        data: {
          action: AuditAction.UPDATE,
          actorId: auditActor.id,
          targetId: updatedUser.id,
          targetType: AuditTargetType.USER,
        },
      });

      return updatedUser;
    }),

  //Permet de supprimer un utilisateur
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).deleteOwn("user").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unsufficient privileges",
          cause: "User cannot do this action based his current role",
        });
      }

      const temp = await db.user.findUnique({
        where: { id: input.id },
      });

      if (!temp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }

      if (
        temp.role !== "ADMIN" &&
        !can(ctx.session).deleteAny("admin").granted
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unsufficient privileges",
          cause: "User cannot do this action based his current role",
        });
      }

      const auditActor = await db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!auditActor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Audit Actor not found, cannot delete user",
        });
      }

      const baseUser = await db.user
        .findUniqueOrThrow({
          where: { id: input.id },
        })
        .catch(() => {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        });

      const deletedUser = await db.user
        .delete({ where: { id: input.id } })
        .catch((error) => {
          console.error("Error deleting user:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete user",
          });
        });

      if (!deletedUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
        });
      }

      await db.auditLog.create({
        data: {
          action: AuditAction.DELETE,
          actorId: auditActor.id,
          targetId: deletedUser.id,
          targetType: AuditTargetType.USER,
          meta: { deletedData: baseUser },
        },
      });

      return deletedUser;
    }),

  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
});
