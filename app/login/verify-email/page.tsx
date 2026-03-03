import { verifyEmailAction } from "@/app/lib/auth-actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "メールアドレス認証 | Todo Today",
  description: "メールアドレスの認証を行います。",
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string; email?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white py-4 px-2 shadow-sm flex flex-col justify-center">
          <h1 className="text-xl font-bold text-red-600 text-center">
            無効なURLです
          </h1>
          <p className="mt-3 text-sm text-slate-600 text-center">
            認証用URLが正しくありません。
            <br />
            再度アカウント作成からお試しください。
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white text-center"
          >
            アカウント作成へ
          </Link>
        </div>
      </main>
    );
  }

  const result = await verifyEmailAction(token, email);

  if (result.ok) {
    redirect("/login?verified=1");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-3">
      <div className="w-full max-w-md rounded-2xl bg-white py-4 px-2 shadow-sm flex flex-col justify-center">
        <h1 className="text-xl font-bold text-red-600 text-center">
          認証に失敗しました
        </h1>
        <p className="mt-3 text-sm text-slate-600 whitespace-pre-line text-center">
          {result.error}
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link
            href="/signup"
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 text-nowrap"
          >
            アカウント作成へ
          </Link>
          <Link
            href="/login"
            className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white text-nowrap"
          >
            ログインへ
          </Link>
        </div>
      </div>
    </main>
  );
}
