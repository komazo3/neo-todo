"use client";

import { MenuItem, TextField } from "@mui/material";
import { DISPLAYSTATUS } from "@/app/lib/constants";

export default function StatusFilter({
  current,
  onChange,
}: {
  current: string;
  onChange: (value: string) => void;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  return (
    <label className="block">
      <TextField
        label="ステータス"
        size="small"
        value={current}
        select
        fullWidth
        onChange={handleChange}
      >
        <MenuItem value={DISPLAYSTATUS.ALL}>すべて</MenuItem>
        <MenuItem value={DISPLAYSTATUS.UNTOUCHED}>未完了</MenuItem>
        <MenuItem value={DISPLAYSTATUS.DONE}>完了</MenuItem>
      </TextField>
    </label>
  );
}
