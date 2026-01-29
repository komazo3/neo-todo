"use client";

import { useToast } from "@/app/components/toastProvider";
import { UpdateFormState, updateTodoAction } from "@/app/lib/actions";
import { PRIORITY_DDL_ITEMS } from "@/app/lib/constants";
import {
  todoFormSchema,
  type TodoFormErrors,
  type TodoFormInput,
} from "@/app/lib/schemas";
import type { TodoDTO } from "@/app/lib/types";
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
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

export default function EditTodoForm({ todo }: { todo: TodoDTO }) {
  const toast = useToast();
  const initialState: UpdateFormState = { message: "", errors: {} };
  const [serverState, formAction] = useActionState(
    updateTodoAction,
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

    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors as TodoFormErrors);
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
