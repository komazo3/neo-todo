import { auth } from "@/auth";
import SignupForm from "./signupForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "アカウント作成 | Todo Today",
  description: "Todo Today のアカウントを作成します。",
};

export default async function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <SignupForm />
    </main>
  );
}
