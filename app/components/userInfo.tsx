"use client";

import Link from "next/link";
import Image from "next/image";
import { getInitial } from "@/app/lib/util";
import type { UserLite } from "@/app/lib/types";
import { Button } from "@mui/material";

export default function UserInfo({ user }: { user: UserLite }) {
  return (
    <Button
      component={Link}
      href="/mypage"
      className="rounded-xl border-gray-400"
    >
      <div className="flex items-center gap-2 px-2 py-1">
        {/* Avatar */}
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
          {user.image ? (
            <Image
              src={user.image}
              alt={`${user.name}のアバター`}
              width={36}
              height={36}
              className="object-cover"
              referrerPolicy="no-referrer"
              unoptimized
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
