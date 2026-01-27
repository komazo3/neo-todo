"use client";

import { ListItem, MenuItem, TextField } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DISPLAYSTATUS } from "../lib/constants";

export default function StatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="block">
      <span className="sr-only">ステータス</span>
      <TextField
        label="ステータス"
        size="small"
        value={current}
        select
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
      >
        <MenuItem value={DISPLAYSTATUS.ALL}>すべて</MenuItem>
        <MenuItem value={DISPLAYSTATUS.UNTOUCHED}>未完了</MenuItem>
        <MenuItem value={DISPLAYSTATUS.DONE}>完了</MenuItem>
      </TextField>
    </label>
  );
}
