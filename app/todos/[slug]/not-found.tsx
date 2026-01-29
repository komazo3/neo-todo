import Link from "next/link";
import { Button } from "@mui/material";

export default function TodoNotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-slate-600">
        編集しようとした TODO は見つかりませんでした。
      </p>
      <Button component={Link} href="/todos" variant="outlined">
        一覧画面に戻る
      </Button>
    </div>
  );
}
