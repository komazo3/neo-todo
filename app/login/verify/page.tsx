import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          メールを送信しました
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          受信箱を確認して、届いたリンクを開いてください。
          <br />
          迷惑メールも確認してください。
        </p>

        <div className="mt-6 flex gap-2">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            ログイン画面へ戻る
          </Link>

          <Link
            href="/todos"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            TODOへ
          </Link>
        </div>
      </div>
    </main>
  );
}
