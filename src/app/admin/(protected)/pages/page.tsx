import { type Metadata } from "next";

import { Link } from "~/app/_components/ui/link";
import { DataTablePages } from "~/app/_components/pages";
import { db } from "~/server/db";
import "~/styles/globals.css";
import { HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Gestion des pages | Racoon CMS",
};

export default async function Users() {
  const pages = await db.page.findMany({
    include: {
      SeoImage: true,
      CreatedBy: true,
      Revisions: true,
    },
  });

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <DataTablePages data={pages}>
            <Link href="/admin/pages/new" className="w-full lg:w-auto">
              Ajouter une page
            </Link>
          </DataTablePages>
        </div>
      </main>
    </HydrateClient>
  );
}
