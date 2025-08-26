import { PageStatus, type Prisma } from "@prisma/client";
import { z } from "zod";

export type PageWithAll = Prisma.PageGetPayload<{
  include: {
    SeoImage: true;
    CreatedBy: true;
    Revisions: true;
  };
}>;

export const PageStatusEnum = z.nativeEnum(PageStatus);
