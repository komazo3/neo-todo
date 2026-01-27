"use client";
import { useToast } from "@/app/components/toastProvider";
import { CreateFormState, createTodoAction } from "@/app/lib/actions";
import { PRIORITY_DDL_ITEMS } from "@/app/lib/constants";
import {
  Button,
  Card,
  CardActions,
  FormHelperText,
  MenuItem,
  TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { startTransition, useActionState, useMemo, useState } from "react";
import { z } from "zod";

export default function Form() {
  const toast = useToast();
  const clientSchema = z.object({
    title: z.string().min(1, "タイトルは必須です").max(50, "最大50文字です"),
    content: z.string().min(1, "内容は必須です").max(500, "最大500文字です"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
      message: "優先度を選択してください",
    }),
    // formData は string で来るので string で受けるのが安全
    deadline: z
      .string()
      .min(1, "期限は必須です")
      .transform((v) => new Date(v))
      .refine((d) => !Number.isNaN(d.getTime()), "期限を正しく入力してください")
      .refine((d) => d >= new Date(), "現在以降の日時を入力してください"),
  });

  type TodoInput = z.infer<typeof clientSchema>;
  type ClientErrors = Partial<Record<keyof TodoInput, string[]>>;

  const initialState: CreateFormState = { message: "", errors: {} };
  const [serverState, formAction] = useActionState(
    createTodoAction,
    initialState,
  );

  const [clientErrors, setClientErrors] = useState<ClientErrors>({});

  // 便利：クライアント→サーバーの順で表示
  const mergedErrors = (field: keyof TodoInput) =>
    clientErrors[field]?.length
      ? clientErrors[field]
      : (serverState.errors?.[field] as string[] | undefined);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 直前の client error はクリア（ここは好み）
    setClientErrors({});

    const formData = new FormData(e.currentTarget);

    const parsed = clientSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
      priority: formData.get("priority"),
      deadline: formData.get("deadline"),
    });

    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors as ClientErrors);
      return;
    }

    // OKなら server action 実行
    startTransition(() => {
      formAction(formData);
      toast.success("追加しました。");
    });
  }

  const titleErrors = mergedErrors("title");
  const contentErrors = mergedErrors("content");
  const priorityErrors = mergedErrors("priority");
  const deadlineErrors = mergedErrors("deadline");

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={onSubmit}>
        <div>
          <TextField
            id="title"
            name="title"
            margin="normal"
            label="*タイトル"
            variant="outlined"
            fullWidth
            slotProps={{ htmlInput: { maxLength: 50 } }}
            error={!!titleErrors?.length}
          />
          <FormHelperText>最大50文字</FormHelperText>

          {titleErrors?.length && (
            <FormHelperText error>{titleErrors[0]}</FormHelperText>
          )}
        </div>

        <div>
          <TextField
            id="content"
            name="content"
            multiline
            margin="normal"
            rows={10}
            label="*内容"
            variant="outlined"
            fullWidth
            slotProps={{ htmlInput: { maxLength: 500 } }}
            error={!!contentErrors?.length}
          />
          <FormHelperText>最大500文字</FormHelperText>

          {contentErrors?.length && (
            <FormHelperText error>{contentErrors[0]}</FormHelperText>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <TextField
              id="outlined-select-currency"
              name="priority"
              select
              label="*優先度"
              fullWidth
              error={!!priorityErrors?.length}
            >
              <MenuItem value="" disabled>
                選択してください
              </MenuItem>
              {PRIORITY_DDL_ITEMS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {priorityErrors?.length && (
              <FormHelperText error>{priorityErrors[0]}</FormHelperText>
            )}
          </div>

          <div>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ja}
            >
              <DateTimePicker
                name="deadline"
                label="*期限"
                sx={{ width: "100%" }}
                slotProps={{
                  textField: {
                    error: !!deadlineErrors?.length,
                  },
                }}
                disablePast
              />
            </LocalizationProvider>
            {deadlineErrors?.length && (
              <FormHelperText error>{deadlineErrors[0]}</FormHelperText>
            )}
          </div>
        </div>

        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button component={Link} href="/todos">
            キャンセル
          </Button>

          <Button type="submit" color="primary">
            追加
          </Button>
        </CardActions>
      </form>
    </Card>
  );
}
