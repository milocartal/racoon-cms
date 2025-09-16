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

export const pageSchema = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string(),
  locale: z.string().default("fr"),
  status: PageStatusEnum,
  publishedAt: z.date().optional().nullable(),
  content: z.string(),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
  seoImageId: z.string().optional().nullable(),
  seoNoIndex: z.boolean().default(false),
  createdById: z.string().optional().nullable(),
  updatedById: z.string().optional().nullable(),
});
