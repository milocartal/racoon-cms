import { MediaKind } from "@prisma/client";
import z from "zod";

export const MediaKindEnum = z.nativeEnum(MediaKind);

export const mediaSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, { message: "Name must be at least 1 character long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
  kind: MediaKindEnum.optional(), // Ajoutez les valeurs de MediaKind selon votre enum
  checksum: z.string().optional(),
  mimeType: z
    .string({ required_error: "MIME type is required" })
    .min(1, { message: "MIME type must be at least 1 character long" })
    .max(255, { message: "MIME type must be at most 255 characters long" }),
  url: z.string().url().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  sizeBytes: z.number().int().optional(),
  alt: z.string().optional(),
});
