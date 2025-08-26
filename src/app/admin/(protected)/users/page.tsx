import { type Metadata } from "next";

import { Link } from "~/app/_components/ui/link";
import { DataTableUser } from "~/app/_components/user/datatable";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Utilisateurs | Racoon CMS",
  description: "Plateforme de mise en relation",
};

export default async function Users() {
  const users = await db.user.findMany({
    include: {
      PagesCreated: true,
      PagesUpdated: true,
      Revisions: true,
      AuditLogs: true,
    },
  });

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <DataTableUser data={users}>
            <Link href="/admin/users/new" className="w-full lg:w-auto">
              Créer un utilisateur
            </Link>
          </DataTableUser>
        </div>
      </main>
    </HydrateClient>
  );
}
