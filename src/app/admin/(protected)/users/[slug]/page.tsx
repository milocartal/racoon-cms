import { type Metadata } from "next";
import { forbidden, notFound, unauthorized } from "next/navigation";

import { UpdateUser } from "~/app/_components/user/update";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";
import { can } from "~/utils/accesscontrol";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await db.user.findUnique({
    where: {
      id: (await params).slug,
    },
  });
  if (!user) {
    return {
      title: "Utilisateur introuvable",
      description: "L'utilisateur que vous cherchez n'existe pas",
    };
  }
  return {
    title: `Édition de ${user.name}`,
    description: `Édition du profil utilisateur de ${user.name}`,
  };
}

export default async function UserDetail({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session) {
    unauthorized();
  }

  if (!can(session).updateAny("user").granted) {
    forbidden();
  }

  const user = await db.user.findUnique({
    where: { id: slug },
  });

  if (!user) {
    notFound();
  }
  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <UpdateUser session={session} user={user} />
        </div>
      </main>
    </HydrateClient>
  );
}
