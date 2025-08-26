import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

import { LoginForm } from "~/app/_components/login/form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-12 p-4">
        <LoginForm session={session} />
      </main>
    </HydrateClient>
  );
}
