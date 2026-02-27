import type { NextAuthConfig } from "next-auth";
import { prisma } from "./app/lib/prisma";

export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  callbacks: {
    // 1. JWTトークンにDBのユーザーIDを書き込む
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // 2. セッションオブジェクトにトークンのIDを渡す
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // ✅ 未ログインでも許可する（公開）
      const publicPaths = ["/login", "/signup", "/login/verify"];
      const isPublic = publicPaths.some((p) => pathname.startsWith(p));

      // ✅ ログイン必須（保護）
      const protectedPaths = ["/todos", "/dashboard"];
      const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

      // 1) ログイン済みが公開ページに来たら /todos
      if (isLoggedIn && isPublic) {
        return Response.redirect(new URL("/todos", nextUrl));
      }

      // 2) 未ログインが保護ページに来たら /login
      if (!isLoggedIn && isProtected) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // 3) それ以外は通す
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
