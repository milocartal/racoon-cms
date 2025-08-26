import Link from "next/link";

import CustomLexicalEditor from "~/app/_components/lexical/editor/LexicalEditor";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function AdminDashboard() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Racoon <span className="text-[hsl(280,100%,70%)]">CMS</span> - by
            Cart&apos;All
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <article className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20">
              <h3 className="text-2xl font-bold">C&apos;est la merde</h3>
              <div className="text-lg">
                Je ne sais pas pourquoi mais j&apos;ai l&apos;impression que
                c&apos;est la merde.
              </div>
            </article>

            <article className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20">
              <h3 className="text-2xl font-bold">Connexion</h3>
              <div className="text-lg">Bientôt disponible (à venir)</div>
            </article>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
        <div className="App">
          <CustomLexicalEditor />
        </div>
      </main>
    </HydrateClient>
  );
}
