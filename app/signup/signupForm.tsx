"use client";

import { signupAction, type SignupFormState } from "@/app/lib/auth-actions";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormHelperText,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useActionState } from "react";

const initialState: SignupFormState = {};

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader title="アカウント作成" />
      <CardContent>
        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <TextField
              fullWidth
              type="email"
              name="email"
              label="メールアドレス"
              required
              autoComplete="email"
              defaultValue={state.fields?.email}
              error={!!state.errors?.email?.length}
            />
            {state.errors?.email?.map((msg, i) => (
              <FormHelperText key={i} error>
                {msg}
              </FormHelperText>
            ))}
          </div>
          <div>
            <TextField
              fullWidth
              type="password"
              name="password"
              label="パスワード"
              required
              autoComplete="new-password"
              error={!!state.errors?.password?.length}
              helperText={
                <p>
                  ・8文字以上
                  <br />
                  ・英字と数字を含む
                </p>
              }
            />
            {state.errors?.password?.map((msg, i) => (
              <FormHelperText key={i} error>
                {msg}
              </FormHelperText>
            ))}
          </div>
          <div>
            <TextField
              fullWidth
              type="password"
              name="passwordConfirm"
              label="パスワード（確認用）"
              required
              autoComplete="new-password"
              error={!!state.errors?.passwordConfirm?.length}
            />
            {state.errors?.passwordConfirm?.map((msg, i) => (
              <FormHelperText key={i} error>
                {msg}
              </FormHelperText>
            ))}
          </div>
          {state.message && (
            <FormHelperText error>{state.message}</FormHelperText>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isPending}
          >
            アカウントを作成する
          </Button>
        </form>
        <Divider sx={{ my: 2 }} />
        <p className="text-center text-sm text-slate-600">
          すでにアカウントをお持ちの方は
          <br />
          <Link href="/login" className="ml-1 text-slate-900 underline">
            ログイン
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
