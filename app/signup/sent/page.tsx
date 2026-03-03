import Link from "next/link";

export const metadata = {
  title: "認証メールを送信しました | Todo Today",
  description: "メールアドレスの認証用リンクを送信しました。",
};

type SentPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function SignupSentPage({ searchParams }: SentPageProps) {
  const { email } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          認証メールを送信しました
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {email ? (
            <>
              <strong>{decodeURIComponent(email)}</strong>
              に認証用のリンクを送りました。
            </>
          ) : (
            "登録したメールアドレスに認証用のリンクを送りました。"
          )}
          <br />
          メール内のリンクをクリックして、アカウントを有効にしてください。
          <br />
          迷惑メールフォルダもご確認ください。
        </p>

        <div className="mt-6 flex gap-2">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    </main>
  );
}
