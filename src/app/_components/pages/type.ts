import type { Page } from "@prisma/client";
import { z } from "zod";
import { PageStatusEnum } from "~/lib/models/Pages";

export interface UpdatePageProps {
  page: Page;
}

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
