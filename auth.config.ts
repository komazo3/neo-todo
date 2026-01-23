import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  // callbacks: {
  //   authorized({ auth, request: { nextUrl } }) {
  //     const isLoggedIn = !!auth?.user;

  //     const isOnTodos = nextUrl.pathname.startsWith("/todos");
  //     const isOnLogin = nextUrl.pathname === "/login";

  //     // 未ログインで /todos に来たらブロック（→ signIn ページへ）
  //     if (isOnTodos && !isLoggedIn) {
  //       return false;
  //     }

  //     // ログイン済みで /login に来たら /todos へ
  //     if (isOnLogin && isLoggedIn) {
  //       return Response.redirect(new URL("/todos", nextUrl));
  //     }

  //     return true;
  //   },
  // },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
