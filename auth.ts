import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./app/lib/prisma";
import Nodemailer from "next-auth/providers/nodemailer";
import { sendVerificationRequest } from "./app/lib/mail";

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
