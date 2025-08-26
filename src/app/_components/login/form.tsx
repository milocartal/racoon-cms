"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { signIn } from "next-auth/react";

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";

import { Input } from "~/app/_components/ui/input";

import { useRef } from "react";
import { ConnectionButton } from "../connection/button";
import type { Session } from "next-auth";

const LoginSchema = z.object({
  email: z
    .string({ required_error: "Le nom est requis" })
    .email({ message: "L'email doit être valide" })
    .min(1, "Le nom est requis"),
  password: z
    .string({ required_error: "La description est requise" })
    .min(5, "La description est requise")
    .max(64, "Le mot de passe doit faire entre 5 et 64 caractères"),
});

export const LoginForm: React.FC<{ session: Session | null }> = ({
  session,
}) => {
  const router = useRouter();

  const passwordRef = useRef<HTMLInputElement>(null);

  function togglePasswordVisibility() {
    if (passwordRef.current) {
      const type =
        passwordRef.current.type === "password" ? "text" : "password";
      passwordRef.current.type = type;
    }
  }

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    })
      .then((result) => {
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Connexion réussie !");
          router.refresh(); // Redirect to the home page or a specific page after successful sign-in
        }
      })
      .catch((error) => {
        console.error("Sign-in error:", error);
        toast.error("Une erreur est survenue lors de la connexion.");
      });
  }

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Veuillez vous connecter pour accéder à votre compte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col items-start gap-4"
          >
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

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
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

            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={togglePasswordVisibility}
            >
              Voir le mot de passe
            </Button>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex w-full flex-col items-center justify-center gap-2">
        <span className="text-sm">Pas encore de compte ?</span>
        <Button
          variant="accent"
          size="lg"
          onClick={() => router.push("/register")}
        >
          S&apos;inscrire
        </Button>
        <ConnectionButton session={session} />
      </CardFooter>
    </Card>
  );
};
