"use client";

import { useToast } from "@/app/components/toastProvider";
import { CreateFormState, createTodoAction } from "@/app/lib/actions";
import { PRIORITY_DDL_ITEMS } from "@/app/lib/constants";
import {
  todoFormSchema,
  type TodoFormErrors,
  type TodoFormInput,
} from "@/app/lib/schemas";
import {
  Button,
  Card,
  CardActions,
  FormHelperText,
  MenuItem,
  TextField,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import Link from "next/link";
import { parse } from "path";
import { startTransition, useActionState, useState } from "react";

export default function NewTodoForm() {
  const toast = useToast();
  const initialState: CreateFormState = { message: "", errors: {} };
  const [serverState, formAction, isPending] = useActionState(
    createTodoAction,
    initialState,
  );
  const [clientErrors, setClientErrors] = useState<TodoFormErrors>({});

  const mergedErrors = (field: keyof TodoFormInput) =>
    clientErrors[field]?.length
      ? clientErrors[field]
      : (serverState.errors?.[field] as string[] | undefined);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 直前の client error はクリア（ここは好み）
    setClientErrors({});

    const formData = new FormData(e.currentTarget);

    const parsed = todoFormSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
      priority: formData.get("priority"),
      deadlineDate: formData.get("deadlineDate"),
      deadlineTime: formData.get("deadlineTime"),
    });

    console.log(typeof formData.get("deadlineDate"));
    console.log(parsed);
    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors as TodoFormErrors);
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
  const deadlineDateErrors = mergedErrors("deadlineDate");
  const deadlineTimeErrors = mergedErrors("deadlineTime");

  return (
    <Card className="px-5 py-2">
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-full">
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

          <div className="col-span-full">
            <TextField
              id="content"
              name="content"
              multiline
              margin="normal"
              rows={9}
              label="内容"
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

          <div className="col-span-full sm:col-span-1">
            <TextField
              id="outlined-select-currency"
              name="priority"
              select
              label="*優先度"
              fullWidth
              defaultValue={""}
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

          <div className="col-span-full sm:col-span-1">
            <DatePicker
              name="deadlineDate"
              label="*期限日"
              sx={{ width: "100%" }}
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
          <div className="col-span-full sm:col-span-1">
            <TimePicker
              name="deadlineTime"
              sx={{ width: "100%" }}
              label="時刻"
              slotProps={{
                textField: { error: !!deadlineTimeErrors?.length },
              }}
            />
            {deadlineTimeErrors?.length && (
              <FormHelperText error>{deadlineTimeErrors[0]}</FormHelperText>
            )}
          </div>
        </div>

        <CardActions sx={{ justifyContent: "flex-end" }} className="mt-5">
          <Link href="/todos">
            <Button variant="outlined">キャンセル</Button>
          </Link>

          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={isPending}
          >
            追加
          </Button>
        </CardActions>
      </form>
    </Card>
  );
}
