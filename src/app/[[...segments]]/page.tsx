// app/[[...segments]]/page.tsx
import { notFound, redirect, RedirectType } from "next/navigation";
import { draftMode } from "next/headers";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

function normalizePath(segments?: string[]) {
  if (!segments || segments.length === 0) return "/";
  const joined = segments
    .map((s) => decodeURIComponent(s))
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/");
  // Pas de slash final (sauf home)
  return joined === "" ? "/" : "/" + joined.replace(/\/$/, "");
}

export default async function PageRoute({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const session = await auth();
  const { segments } = await params;
  const path = normalizePath(segments);
  const { isEnabled } = await draftMode();

  // 1) Cherche la page par path (ton schema a path @unique)
  const page = await db.page.findFirst({
    where: {
      path,
      ...(isEnabled ? {} : { status: "PUBLISHED" }),
    },
  });

  if (page) {
    return <div className="prose mx-auto p-6">{page.title}</div>;
  }

  // 2) Fallback: redirections (301/302)
  const r = await db.redirect.findUnique({ where: { fromPath: path } });
  if (r) {
    if (r.permanent) {
      // 301
      redirect(r.toPath, RedirectType.replace);
    } else {
      // 302
      redirect(r.toPath, RedirectType.push);
    }
  }

  if (!page && !r && (!segments || segments.length === 0)) {
    // Si aucune page n'est trouvée et qu'il n'y a pas de redirection,
    // on renvoie sur la page de connexion.
    if (session) redirect("/admin/dashboard");
    else redirect("/admin/login");
  }

  // 3) 404
  return notFound();
}
