"use client";

import { ListItem, MenuItem, TextField } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DISPLAYSTATUS, SORTITEMS } from "../lib/constants";

export default function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="block">
      <TextField
        label="並び替え"
        size="small"
        value={current}
        select
        fullWidth
        onChange={onChange}
      >
        <MenuItem value={SORTITEMS.PRIORITY_ASC}>優先度が低い順</MenuItem>
        <MenuItem value={SORTITEMS.PRIORITY_DESC}>優先度が高い順</MenuItem>
        <MenuItem value={SORTITEMS.DEADLINE_ASC}>期限が近い順</MenuItem>
        <MenuItem value={SORTITEMS.DEADLINE_DESC}>期限が遠い順</MenuItem>
      </TextField>
    </label>
  );
}
