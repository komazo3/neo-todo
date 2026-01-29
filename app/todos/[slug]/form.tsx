"use client";

import { useToast } from "@/app/components/toastProvider";
import { UpdateFormState, updateTodoAction } from "@/app/lib/actions";
import { PRIORITY_DDL_ITEMS } from "@/app/lib/constants";
import { TodoDTO } from "@/app/lib/types";
import {
  Button,
  Card,
  CardActions,
  FormHelperText,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { z } from "zod";

export default function Form({ todo }: { todo: TodoDTO }) {
  const toast = useToast();
  const clientSchema = z
    .object({
      title: z.string().min(1, "タイトルは必須です").max(50, "最大50文字です"),
      content: z.string().max(500, "最大500文字です"),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
        message: "優先度を選択してください",
      }),
      deadlineDate: z
        .string()
        .min(1, "期限日は必須です")
        .transform((v) => new Date(v))
        .refine(
          (d) => !Number.isNaN(d.getTime()),
          "期限日を正しく入力してください",
        )
        .refine(
          (d) => d >= startOfDay(new Date()),
          "現在以降の日を入力してください",
        ),
      deadlineTime: z.preprocess(
        (v) => (v === "" ? undefined : v),
        z
          .string()
          .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "時刻の形式が正しくありません",
          )
          .optional(),
      ),
    })
    .superRefine((data, ctx) => {
      const [y, m, d] = format(data.deadlineDate, "yyyy-MM-dd")
        .split("-")
        .map(Number);

      // 日付はローカル 00:00 をベースに作る（UTC事故回避）
      const deadline = new Date(y, m - 1, d, 0, 0, 0, 0);

      if (data.deadlineTime) {
        const [hh, mm] = data.deadlineTime.split(":").map(Number);
        deadline.setHours(hh, mm, 0, 0);
      } else {
        // 時刻なし＝終日扱い（好きに決めてOK）
        deadline.setHours(23, 59, 59, 0);
      }

      // 「現在以降」判定（ミリ秒比較）
      const now = new Date();
      if (deadline.getTime() < now.getTime()) {
        // 👇 日付にも
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deadlineDate"],
          message: "期限は現在以降を指定してください。",
        });

        // 👇 時刻にも
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deadlineTime"],
          message: "期限は現在以降を指定してください。",
        });
      }
    });

  type TodoInput = z.infer<typeof clientSchema>;
  type ClientErrors = Partial<Record<keyof TodoInput, string[]>>;

  const initialState: UpdateFormState = { message: "", errors: {} };
  const [serverState, formAction] = useActionState(
    updateTodoAction,
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
      deadlineDate: formData.get("deadlineDate"),
      deadlineTime: formData.get("deadlineTime"),
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

  const titleErrors = mergedErrors("title");
  const contentErrors = mergedErrors("content");
  const priorityErrors = mergedErrors("priority");
  const deadlineDateErrors = mergedErrors("deadlineDate");
  const deadlineTimeErrors = mergedErrors("deadlineTime");

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={onSubmit}>
        <input type="hidden" name="id" value={todo.id} />
        <div>
          <TextField
            id="title"
            name="title"
            margin="normal"
            label="*タイトル"
            variant="outlined"
            fullWidth
            slotProps={{ htmlInput: { maxLength: 50 } }}
            defaultValue={todo.title}
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
            rows={5}
            label="内容"
            variant="outlined"
            fullWidth
            slotProps={{ htmlInput: { maxLength: 500 } }}
            defaultValue={todo.content}
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
              defaultValue={todo.priority}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ja}
            >
              <div>
                <DatePicker
                  name="deadlineDate"
                  label="*期限日"
                  sx={{ width: "100%" }}
                  defaultValue={todo.deadline}
                  slotProps={{
                    textField: {
                      error: !!deadlineDateErrors?.length,
                    },
                  }}
                  disablePast
                />
                {deadlineDateErrors?.length && (
                  <FormHelperText error>{deadlineDateErrors[0]}</FormHelperText>
                )}
              </div>
              <div>
                <TimePicker
                  name="deadlineTime"
                  label="時刻"
                  defaultValue={todo.deadline}
                  slotProps={{
                    textField: { error: !!deadlineTimeErrors?.length },
                  }}
                />
                {deadlineTimeErrors?.length && (
                  <FormHelperText error>{deadlineTimeErrors[0]}</FormHelperText>
                )}
              </div>
            </LocalizationProvider>
          </div>
        </div>

        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button component={Link} href="/todos">
            キャンセル
          </Button>

          <Button type="submit" color="primary">
            編集
          </Button>
        </CardActions>
      </form>
    </Card>
  );
}
