import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { db } from "~/server/db";
import { Toaster } from "sonner";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.setting.findUnique({
    where: { id: "SETTINGS" },
  });

  return {
    title: settings?.siteName ?? "Racoon CMS",
    description:
      settings?.slogan ?? "Un CMS flexible et puissant pour les développeurs.",
    icons: [
      { rel: "icon", url: "/favicon.ico" },
      { rel: "icon", url: "/icon0.svg" },
    ],
  };
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await db.setting.findUnique({
    where: { id: "SETTINGS" },
  });

  return (
    <html lang={settings?.domain ?? "en"} className={`${geist.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Service d'Administration et de Gestion des Aventures"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon1.png" />
        <link
          rel="icon"
          type="image/svg+xml"
          sizes="1024x1024"
          href="/icon0.svg"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="Racoon CMS" />
      </head>
      <body
        style={
          {
            ["--primary" as string]:
              settings?.primaryColor ?? "oklch(0.205 0 0)",
            ["--secondary" as string]:
              settings?.secondaryColor ?? "oklch(0.97 0 0)",
            ["--background" as string]:
              settings?.backgroundColor ?? "oklch(1 0 0)",
            ["--text" as string]: settings?.textColor ?? "oklch(0 0 0)",
          } as React.CSSProperties
        }
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
