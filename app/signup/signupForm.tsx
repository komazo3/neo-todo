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
import { useActionState, useState } from "react";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const initialState: SignupFormState = {};

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowPasswordConfirm = () =>
    setShowPasswordConfirm((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

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
              sx={{
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px white inset",
                  WebkitTextFillColor: "#000",
                },
              }}
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
            <FormControl fullWidth variant="outlined" required>
              <InputLabel htmlFor="password">パスワード</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                sx={{
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    WebkitTextFillColor: "#000",
                  },
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword
                          ? "hide the password"
                          : "display the password"
                      }
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label="パスワード"
              />
            </FormControl>
            <FormHelperText>8文字以上</FormHelperText>
            <FormHelperText>英字と数字を含む</FormHelperText>
            {state.errors?.password?.map((msg, i) => (
              <FormHelperText key={i} error>
                {msg}
              </FormHelperText>
            ))}
          </div>
          <div>
            <FormControl fullWidth variant="outlined" required>
              <InputLabel htmlFor="passwordConfirm">
                パスワード(確認用)
              </InputLabel>
              <OutlinedInput
                id="passwordConfirm"
                name="passwordConfirm"
                type={showPasswordConfirm ? "text" : "password"}
                autoComplete="new-password"
                sx={{
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    WebkitTextFillColor: "#000",
                  },
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPasswordConfirm
                          ? "hide the password"
                          : "display the password"
                      }
                      onClick={handleClickShowPasswordConfirm}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPasswordConfirm ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label="パスワード(確認用)"
              />
            </FormControl>
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
