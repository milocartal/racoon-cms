import { type Metadata } from "next";
import { forbidden, unauthorized } from "next/navigation";

import { auth } from "~/server/auth";

import { HydrateClient } from "~/trpc/server";
import { can } from "~/utils/accesscontrol";

export const metadata: Metadata = {
  title: "Nouvelle page | Racoon CMS",
  description: "Créez une nouvelle page dans Racoon CMS",
};

export default async function PageUpdate() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  if (!can(session).updateAny("pages").granted) {
    forbidden();
  }

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <h1 className="text-text mb-4 text-2xl font-bold">
            Mettre à jour une page
          </h1>
        </div>
      </main>
    </HydrateClient>
  );
}
