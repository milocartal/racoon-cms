import { type Metadata } from "next";

import { CreateUser } from "~/app/_components/user/create";
import { auth } from "~/server/auth";

import { HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Nouvel utilisateur | Racoon CMS",
  description: "Créez un nouvel accès à Racoon CMS",
};

export default async function NewUser() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <h1 className="text-text mb-4 text-2xl font-bold">
            Créer un utilisateur
          </h1>

          <CreateUser session={session} />
        </div>
      </main>
    </HydrateClient>
  );
}
