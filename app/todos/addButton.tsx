"use client";

import { Button } from "@mui/material";
import Link from "next/link";

export default function AddButton() {
  return (
    <Link href="/todos/new">
      <Button variant="contained" className="w-full">
        ＋ TODOを追加
      </Button>
    </Link>
  );
}
