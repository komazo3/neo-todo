"use client";
import { Button, TextField } from "@mui/material";
import React, { useActionState } from "react";
import { authenticate } from "../lib/auth-actions";

export default function CredentialForm() {
  const [state, formAction, isPending] = useActionState(authenticate, {
    success: false,
    message: "",
    fields: {},
  });
  return (
    <form action={formAction}>
      <div className="flex flex-col gap-5">
        <TextField
          fullWidth
          type="email"
          name="email"
          label="メールアドレス"
          required
          autoComplete="email"
          defaultValue={state.fields?.email}
        />
        <TextField
          fullWidth
          type="password"
          name="password"
          label="パスワード"
          required
          autoComplete="current-password"
          defaultValue={state.fields?.password}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isPending}
        >
          メールアドレスでログイン
        </Button>
      </div>
      {state?.message && (
        <p
          className="text-red-500
      "
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
