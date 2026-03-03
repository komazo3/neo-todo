import Link from "next/link";
import { Button } from "@mui/material";

export default function TodoNotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center flex flex-col gap-5">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-slate-600">
        編集しようとした TODO は見つかりませんでした。
      </p>
      <Link href="/todos">
        <Button variant="outlined" className="w-full">
          一覧画面に戻る
        </Button>
      </Link>
    </div>
  );
}
