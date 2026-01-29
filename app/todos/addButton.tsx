"use client";

import { Button } from "@mui/material";
import Link from "next/link";

export default function AddButton() {
  return (
    <Button component={Link} href="/todos/new" variant="contained">
      ＋ TODOを追加
    </Button>
  );
}
