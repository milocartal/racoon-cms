import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session as SessionAuth } from "next-auth";

import { db } from "~/server/db";

import { verify } from "argon2";
import type { Role } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "exemple@cart-all.io",
        },
        password: {
          label: "Mot de passe",
          type: "password",
          placeholder: "******",
        },
      },
      authorize: async (credentials) => {
        console.log("Authorize with credentials:", credentials);
        if (!credentials?.email || !credentials.password) {
          console.warn("Missing credentials");
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user?.passwordHash) {
          console.warn("User not found or password not set");
          return null;
        }

        const isValid = await verify(
          user.passwordHash,
          credentials.password as string,
        );

        if (!isValid) {
          console.warn("Invalid password");
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: SessionAuth; token: JWT }) {
      if (session.user && token) {
        const user = await db.user.findUnique({
          where: { email: session.user.email! },
        });
        if (!user) {
          return {
            ...session,
          };
        }
        session.user.id = user.id;
        session.user.role = user.role;

        return session;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
