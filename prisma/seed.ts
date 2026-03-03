import { hashPassword } from "@/app/lib/password";
import { prisma } from "@/app/lib/prisma";

const users = [
  {
    email: "test1@example.com",
    name: "テストユーザー1",
    password: "Password1",
  },
  {
    email: "test2@example.com",
    name: "テストユーザー2",
    password: "Password2",
  },
  {
    email: "test3@example.com",
    name: "テストユーザー3",
    password: "Password3",
  },
];

async function main() {
  for (const user of users) {
    const hashed = await hashPassword(user.password);

    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: hashed,
        emailVerified: new Date(), // シードなので検証済みとして扱う
      },
    });

    // Credentials アカウントレコードも作成
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "credentials",
          providerAccountId: created.id,
        },
      },
      update: {},
      create: {
        userId: created.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: created.id,
      },
    });

    console.log(`✅ Created: ${user.email} / ${user.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
