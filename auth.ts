import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./app/lib/prisma";
import Nodemailer from "next-auth/providers/nodemailer";
import { sendVerificationRequest } from "./app/lib/mail";
import { z } from "zod";
import { getUserByEmail } from "./app/lib/database";
import bcrypt from "bcryptjs";

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
  session: { strategy: "jwt", maxAge: 43200 },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
        const parsedCredentials = z
          .object({ email: z.email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch)
            return { id: user.id, email: user.email, name: user.name };
        }

        return null;
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
