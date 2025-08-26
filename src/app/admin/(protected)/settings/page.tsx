import { type Metadata } from "next";
import { forbidden, unauthorized } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";
import { can } from "~/utils/accesscontrol";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.setting.findUnique({
    where: { id: "SETTINGS" },
  });

  if (!settings) {
    return {
      title: "Paramètres de l'application",
      description: "Paramètres de l'application",
    };
  }
  return {
    title: `Édition des paramètres de l'application`,
    description: `Édition des paramètres de l'application`,
  };
}

export default async function AppSettings() {
  const session = await auth();
  if (!session) {
    unauthorized();
  }

  if (!can(session).updateAny("settings").granted) {
    forbidden();
  }

  const settings = await db.setting.findUnique({
    where: { id: "SETTINGS" },
  });

  if (!settings) {
    console.warn("Settings not found, creating default settings");
  }
  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          Bienvenue dans les paramètres de l&pos;application.
        </div>
      </main>
    </HydrateClient>
  );
}
