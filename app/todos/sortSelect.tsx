"use client";

import { MenuItem, TextField } from "@mui/material";
import { SORTITEMS } from "../lib/constants";

export default function SortSelect({
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
        label="並び替え"
        size="small"
        value={current}
        select
        fullWidth
        onChange={handleChange}
      >
        <MenuItem value={SORTITEMS.DEADLINE_ASC}>期限が近い順</MenuItem>
        <MenuItem value={SORTITEMS.DEADLINE_DESC}>期限が遠い順</MenuItem>
        <MenuItem value={SORTITEMS.PRIORITY_ASC}>優先度が低い順</MenuItem>
        <MenuItem value={SORTITEMS.PRIORITY_DESC}>優先度が高い順</MenuItem>
      </TextField>
    </label>
  );
}
