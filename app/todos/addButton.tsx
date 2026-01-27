"use client";

import { Button } from "@mui/material";
import Link from "next/link";

export default function () {
  return (
    <Button component={Link} href="/todos/new">
      ＋ TODOを追加
    </Button>
  );
}
