// prisma/seed.ts (ou .mts/.ts)
import { AuditTargetType, PrismaClient } from "@prisma/client";
import { hash, argon2id } from "argon2";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const db = new PrismaClient();

async function main() {
  console.log("Seeding racoons...");

  /* if ((await db.user.count()) > 0) {
    console.log("Racoons are already seeded, aborting.");
    return;
  } */

  // 1) Récupération des identifiants

  let email = process.env.SEED_ADMIN_EMAIL;
  let password = process.env.SEED_ADMIN_PASSWORD;
  let name = process.env.SEED_ADMIN_NAME;
  const rl = readline.createInterface({ input, output });

  if (!email || !password || !name) {
    email = await rl.question("email de l'administrateur : ");
    password = await rl.question("mot de passe de l'administrateur : ");
    name = await rl.question("nom de l'administrateur : ");
  }

  const createPage = await rl.question(
    "souhaitez-vous créer une page d'accueil par défaut ? (oui/non) : ",
  );
  await rl.close();

  // 2) Création de l'admin
  const hashed = await hash(password, { type: argon2id });
  const user = await db.user.upsert({
    where: { email: email },
    update: {},
    create: {
      name: name,
      email: email,
      passwordHash: hashed, // <-- correspond au schéma
      role: "ADMIN",
    },
  });

  await db.auditLog.create({
    data: {
      action: "CREATE",
      targetType: AuditTargetType.USER,
      targetId: user.id,
      meta: { createdBy: "Seed", role: "ADMIN" },
    },
  });

  // 3) Page d'accueil
  if (
    createPage.toLowerCase() === "oui" ||
    createPage.toLowerCase() === "yes" ||
    createPage.toLowerCase() === "y" ||
    createPage.toLowerCase() === "o"
  ) {
    const home = await db.page.upsert({
      where: { path: "/" },
      update: {},
      create: {
        title: "Accueil",
        path: "/",
        status: "PUBLISHED",
        publishedAt: new Date(),
        content: {
          root: {
            type: "root",
            children: [
              {
                type: "paragraph",
                children: [
                  { type: "text", text: "Bienvenue sur Racoon CMS 🦝" },
                ],
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
        },
        seoTitle: "Accueil",
        seoDesc: "Bienvenue sur Racoon CMS",
      },
    });

    await db.auditLog.create({
      data: {
        action: "CREATE",
        targetType: AuditTargetType.PAGE,
        targetId: home.id,
        meta: { createdBy: "Seed" },
      },
    });
  }

  console.log("Seeding racoons finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
