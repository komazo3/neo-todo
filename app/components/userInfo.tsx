"use client";

import Link from "next/link";
import { getInitial } from "../lib/util";
import { Button } from "@mui/material";
import { UserLite } from "../lib/types";

export default function UserInfo({ user }: { user: UserLite }) {
  return (
    <Button
      component={Link}
      href="/mypage"
      className="rounded-xl border-gray-400"
    >
      <div className="flex items-center gap-2  px-2 py-1">
        {/* Avatar */}
        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-white">
          {user.image ? (
            <img
              src={user.image}
              alt={`${user.name} avatar`}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm font-semibold text-slate-700">
              {getInitial(user.name)}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="hidden sm:block">
          <p className="max-w-40 truncate text-sm font-semibold text-slate-900">
            {user.name + " 様"}
          </p>
        </div>
      </div>
    </Button>
  );
}
