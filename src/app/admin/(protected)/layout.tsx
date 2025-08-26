import { auth } from "~/server/auth";

import { forbidden, redirect } from "next/navigation";
import { can } from "~/utils/accesscontrol";
import { Fragment } from "react";
import Navbar from "~/app/_components/navigation/sidebar";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  if (!can(session).readOwn("editor").granted) {
    forbidden();
  }

  return (
    <Fragment>
      <Navbar session={session} />
      <main className="relative max-h-screen min-h-screen w-full overflow-y-auto">
        {children}
      </main>
    </Fragment>
  );
}
