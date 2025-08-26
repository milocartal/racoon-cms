"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "~/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";

import { Input } from "~/app/_components/ui/input";
import { api } from "~/trpc/react";

import { useRef } from "react";

import { can } from "~/utils/accesscontrol";
import { UpdateSchema, type UpdateUserProps } from "./type";

export const UpdateUser: React.FC<UpdateUserProps> = ({ session, user }) => {
  const router = useRouter();

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      toast.success("Compte créé avec succès !");
      router.push("/admin/users"); // Redirect to the users page after successful creation
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      toast.error(
        "Une erreur est survenue lors de la création de l'utilisateur.",
      );
    },
  });

  async function onSubmit(values: z.infer<typeof UpdateSchema>) {
    await updateUser.mutateAsync({
      id: user.id,
      ...values,
    });
  }

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  function togglePasswordVisibility() {
    if (passwordRef.current && confirmPasswordRef.current) {
      const type =
        passwordRef.current.type === "password" ? "text" : "password";
      passwordRef.current.type = type;
      confirmPasswordRef.current.type = type;
    }
  }

  const form = useForm<z.infer<typeof UpdateSchema>>({
    resolver: zodResolver(UpdateSchema),
    defaultValues: {
      name: user.name!,
      email: user.email!,
      role: user.role,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                Nom d&apos;utilisateur <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Milo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                Rôle <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EDITOR">Éditeur</SelectItem>
                  {can(session).updateAny("admin").granted && (
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                  )}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="john@doe.io" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          className="w-full"
          variant="outline"
          onClick={togglePasswordVisibility}
        >
          Voir le mot de passe
        </Button>

        <Button type="submit" className="w-full">
          Créer un utilisateur
        </Button>
      </form>
    </Form>
  );
};
