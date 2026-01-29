"use client";

import Link from "next/link";
import { Button } from "@mui/material";
import UserInfo from "./userInfo";
import { logoutAction } from "../lib/actions";
import { UserLite } from "../lib/types";

export default function HeaderClient({ user }: { user: UserLite | null }) {
  const isLoggedIn = !!user;

  return (
    <header className="fixed z-10 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Button component={Link} href="/todos" aria-label="todos" title="todos">
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            TODO Today
          </span>
        </Button>

        {isLoggedIn && (
          <div className="flex items-center gap-3">
            <UserInfo user={user} />

            <form action={logoutAction}>
              <Button type="submit" variant="outlined"><span className="whitespace-nowrap">Log out</span></Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
