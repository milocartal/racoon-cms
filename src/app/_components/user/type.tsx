import type { Session } from "next-auth";
import { z } from "zod";
import { RoleEnum } from "~/lib/models/User";
import { type User } from "@prisma/client";

export const CreateSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(1, "Le nom est requis")
    .max(64, "Le nom doit faire entre 1 et 64 caractères"),
  email: z
    .string({ required_error: "L'email est requis" })
    .email({ message: "L'email n'est pas valide" })
    .min(1, "L'email est requis"),
  password: z
    .string({ required_error: "Le mot de passe est requis" })
    .min(8, "Le mot de passe doit faire au moins 8 caractères")
    .max(64, "Le mot de passe doit faire entre 8 et 64 caractères"),
  role: RoleEnum,
});

export const UpdateSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(1, "Le nom est requis")
    .max(64, "Le nom doit faire entre 1 et 64 caractères"),
  email: z
    .string({ required_error: "L'email est requis" })
    .email({ message: "L'email n'est pas valide" })
    .min(1, "L'email est requis"),
  role: RoleEnum,
});

export interface CreateUserProps {
  session: Session | null;
}

export interface UpdateUserProps {
  session: Session | null;
  user: User;
}
