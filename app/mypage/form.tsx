"use client";

import { startTransition, useActionState, useState } from "react";
import { UpdateFormState, updateUserAction } from "../lib/actions";
import { z } from "zod";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Card, CardContent, FormControl, FormHelperText } from "@mui/material";
import { User } from "@/generated/prisma/client";
import { useToast } from "../components/toastProvider";

export default function Form({ user }: { user: User }) {
  const toast = useToast();
  const clientSchema = z.object({
    name: z.string().min(1, "名前は必須です").max(50, "最大50文字です"),
  });

  type UserInput = z.infer<typeof clientSchema>;
  type ClientErrors = Partial<Record<keyof UserInput, string[]>>;

  const initialState: UpdateFormState = { message: "", errors: {} };
  const [serverState, formAction] = useActionState(
    updateUserAction,
    initialState,
  );

  const [clientErrors, setClientErrors] = useState<ClientErrors>({});

  // 便利：クライアント→サーバーの順で表示
  const mergedErrors = (field: keyof UserInput) =>
    clientErrors[field]?.length
      ? clientErrors[field]
      : (serverState?.errors?.[field] as string[] | undefined);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 直前の client error はクリア（ここは好み）
    setClientErrors({});

    const formData = new FormData(e.currentTarget);

    const parsed = clientSchema.safeParse({
      name: formData.get("name"),
    });

    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors as ClientErrors);
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
