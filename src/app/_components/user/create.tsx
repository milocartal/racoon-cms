"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "~/app/_components/ui/button";
import {
  Fieldset,
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
import { Role } from "@prisma/client";

import { can } from "~/utils/accesscontrol";
import { CreateSchema, type CreateUserProps } from "./type";

export const CreateUser: React.FC<CreateUserProps> = ({ session }) => {
  const router = useRouter();

  const createUser = api.user.create.useMutation({
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

  async function onSubmit(values: z.infer<typeof CreateSchema>) {
    await createUser.mutateAsync({
      ...values,
    });
  }

  const passwordRef = useRef<HTMLInputElement>(null);

  function togglePasswordVisibility() {
    if (passwordRef.current) {
      const type =
        passwordRef.current.type === "password" ? "text" : "password";
      passwordRef.current.type = type;
    }
  }

  const form = useForm<z.infer<typeof CreateSchema>>({
    resolver: zodResolver(CreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: Role.EDITOR,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-4"
      >
        <Fieldset>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
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
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>
                  Rôle <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EDITOR">Éditeur</SelectItem>
                    {can(session).createAny("admin").granted && (
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        <Fieldset>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full lg:w-3/6">
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

          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full lg:w-2/6">
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input
                    placeholder="******"
                    type="password"
                    {...field}
                    ref={passwordRef}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem className="w-full lg:w-1/6">
            <Button
              type="button"
              className="w-full self-end px-0"
              variant="outline"
              onClick={togglePasswordVisibility}
            >
              Voir le mot de passe
            </Button>
          </FormItem>
        </Fieldset>

        <Button type="submit" className="w-full">
          Créer un utilisateur
        </Button>
      </form>
    </Form>
  );
};
