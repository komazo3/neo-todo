"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import {
  UpdateFormState,
  updateUserAction,
  UpdateUserFormState,
} from "@/app/lib/actions";

import {
  Button,
  Card,
  CardContent,
  FormHelperText,
  TextField,
} from "@mui/material";
import type { User } from "@/generated/prisma/client";
import { useToast } from "@/app/components/toastProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MypageForm({ user }: { user: User }) {
  const router = useRouter();
  const toast = useToast();
  const { update } = useSession();
  const initialState: UpdateUserFormState = {
    message: "",
    errors: {},
    success: false,
    fields: { name: user.name },
  };
  const [state, formAction, isPending] = useActionState(
    updateUserAction,
    initialState,
  );

  // サーバーアクション成功時にセッション更新
  useEffect(() => {
    if (state?.success) {
      update({ name: state.fields?.name }).then(() => {
        // ヘッダのユーザー名を再表示
        router.refresh();
      });
      toast.success("編集しました。");
    }
  }, [state]);

  return (
    <Card className="p-5">
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-5">
            <input type="hidden" name="id" value={user.id} />
            <div>
              <TextField
                key={state.fields?.name}
                id="name"
                name="name"
                label="*名前"
                fullWidth
                variant="outlined"
                slotProps={{ htmlInput: { maxLength: 50 } }}
                defaultValue={state.fields?.name}
                error={!!state.errors?.name}
              />
              <FormHelperText>最大50文字</FormHelperText>
              {state.errors?.name && (
                <FormHelperText error>{state.errors?.name}</FormHelperText>
              )}
            </div>
            <Button type="submit" variant="contained">
              保存
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
