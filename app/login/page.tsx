import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import "./login.css";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { redirect } from "next/navigation";
import CredentialForm from "./credentialLoginForm";
import GoogleLoginForm from "./googleLoginForm";

export const metadata = {
  title: "ログイン | Todo Today",
  description: "Todo Today にログインします。",
};

type LoginPageProps = {
  searchParams: Promise<{ verified?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const showVerifiedMessage = sp?.verified === "1";
  const showCredentialsError = sp?.error === "credentials";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader title="ログイン" />
        <CardContent>
          {showVerifiedMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              メールアドレスを認証しました。ログインしてください。
            </Alert>
          )}
          {showCredentialsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Account not found or password is incorrect.
            </Alert>
          )}
          <div className="flex flex-col gap-5">
            {/* メール + パスワード */}
            <CredentialForm></CredentialForm>
            <Divider>または</Divider>
            {/* Google Login Button */}
            <GoogleLoginForm></GoogleLoginForm>
            {/* <Divider>または</Divider>
            <form
              action={async (formData: FormData) => {
                "use server";
                const email = String(formData.get("email") ?? "").trim();
                if (!email) return;
                await signIn("nodemailer", { email, redirectTo: "/todos" });
              }}
            >
              <div className="flex flex-col gap-5">
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  label="メールアドレス（マジックリンク用）"
                  required
                />
                <Button type="submit" variant="outlined" fullWidth>
                  メールでログインリンクを受け取る
                </Button>
              </div>
            </form> */}
          </div>
          <p className="mt-4 text-center text-sm text-slate-600">
            アカウントをお持ちでない方は
            <br />
            <Link href="/signup" className="ml-1 text-slate-900 underline">
              アカウント作成
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
