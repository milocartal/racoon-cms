import { auth } from "~/server/auth";

import { forbidden, redirect } from "next/navigation";
import { can } from "~/utils/accesscontrol";

import { SidebarProvider } from "../_components/ui/sidebar";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  if (!can(session).readOwn("editor").granted) {
    forbidden();
  }

  return <SidebarProvider>{children}</SidebarProvider>;
}
