import { auth, signOut } from "@/auth";
import { Button } from "@mui/material";
import Link from "next/link";
import UserInfo from "./userInfo";

export default async function Header() {
  const session = await auth();
  const isLoggedIn = session?.user;
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link
          href="/todos"
          aria-label="todos"
          title="todos"
          className="inline-flex items-center gap-2"
        >
          <span className="text-lg font-bold tracking-tight text-slate-900">
            TODO Today
          </span>
        </Link>

        {/* Right: User + Actions */}
        {isLoggedIn && (
          <div className="flex items-center gap-3">
            {/* User */}
            <UserInfo />

            {/* Logout */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                Log out
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
