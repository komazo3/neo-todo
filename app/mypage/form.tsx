"use client";

import { startTransition, useActionState, useState } from "react";
import { UpdateFormState, updateUserAction } from "@/app/lib/actions";
import {
  userFormSchema,
  type UserFormErrors,
  type UserFormInput,
} from "@/app/lib/schemas";
import { Button, Card, CardContent, FormHelperText, TextField } from "@mui/material";
import type { User } from "@/generated/prisma/client";
import { useToast } from "@/app/components/toastProvider";

export default function MypageForm({ user }: { user: User }) {
  const toast = useToast();
  const initialState: UpdateFormState = { message: "", errors: {} };
  const [serverState, formAction] = useActionState(
    updateUserAction,
    initialState,
  );
  const [clientErrors, setClientErrors] = useState<UserFormErrors>({});

  const mergedErrors = (field: keyof UserFormInput) =>
    clientErrors[field]?.length
      ? clientErrors[field]
      : (serverState?.errors?.[field] as string[] | undefined);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 直前の client error はクリア（ここは好み）
    setClientErrors({});

    const formData = new FormData(e.currentTarget);

    const parsed = userFormSchema.safeParse({
      name: formData.get("name"),
    });

    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors as UserFormErrors);
      return;
    }

    // OKなら server action 実行
    startTransition(() => {
      formAction(formData);
      toast.success("編集しました。");
    });
  }

  const nameErrors = mergedErrors("name");
  return (
    <Card className="p-5">
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-5">
            <input type="hidden" name="id" value={user.id} />
            <div>
              <TextField
                id="name"
                name="name"
                label="*名前"
                fullWidth
                variant="outlined"
                defaultValue={user?.name}
                error={!!nameErrors?.length}
              />
              <FormHelperText>最大50文字</FormHelperText>
              {nameErrors?.length && (
                <FormHelperText error>{nameErrors[0]}</FormHelperText>
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
