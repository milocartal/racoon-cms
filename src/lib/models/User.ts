import { Role, type Prisma } from "@prisma/client";
import { z } from "zod";

export type UserWithAll = Prisma.UserGetPayload<{
  include: {
    PagesCreated: true;
    PagesUpdated: true;
    Revisions: true;
    AuditLogs: true;
  };
}>;

export const RoleDisplay = {
  [Role.EDITOR]: "Éditeur",
  [Role.ADMIN]: "Administrateur",
};

export const RoleEnum = z.nativeEnum(Role);
