import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./app/lib/prisma";
import Nodemailer from "next-auth/providers/nodemailer";
import { sendVerificationRequest } from "./app/lib/mail";
import { verifyPassword } from "./app/lib/password";

function defaultNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const noTag = local.split("+")[0] ?? local; // +tag を落とす
  const cleaned = noTag.replace(/[._-]+/g, " ").trim(); // 記号を整形
  const name = cleaned.slice(0, 30);
  return name.length ? name : "User";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
    Credentials({
      name: "メールアドレスとパスワード",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.password) return null;
        const ok = await verifyPassword(password, user.password);
        if (!ok) return null;
        if (!user.emailVerified) return null;
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      // 既に name が入っている場合（Google等）は尊重
      if (user.name) return;
      if (!user.email) return;

      await prisma.user.update({
        where: { id: user.id },
        data: { name: defaultNameFromEmail(user.email) },
      });
    },
  },
});
