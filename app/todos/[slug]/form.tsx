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
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { startTransition, useActionState, useMemo, useState } from "react";

/** JST で表示するための期限日・時刻（サーバーから渡す） */
type EditTodoFormProps = {
  todo: TodoDTO;
  deadlineDateJst?: string;
  deadlineTimeJst?: string;
};

function parseJstToLocalDate(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("/").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function initialDeadlineValue(
  deadlineDateJst: string | undefined,
  deadlineTimeJst: string | undefined,
  todo: TodoDTO,
): Date {
  if (deadlineDateJst && deadlineTimeJst) {
    const d = parseJstToLocalDate(deadlineDateJst, deadlineTimeJst);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const fallback =
    typeof todo.deadline === "string" ? new Date(todo.deadline) : todo.deadline;
  return fallback && !Number.isNaN(fallback.getTime()) ? fallback : new Date();
}

export default function EditTodoForm({
  todo,
  deadlineDateJst,
  deadlineTimeJst,
}: EditTodoFormProps) {
  const toast = useToast();
  const initialState: UpdateFormState = {
    message: "",
    errors: {},
    success: false,
  };
  const [serverState, formAction] = useActionState(
    updateTodoAction,
    initialState,
  );
  const [clientErrors, setClientErrors] = useState<TodoFormErrors>({});

  const [deadlineValue, setDeadlineValue] = useState<Date>(() =>
    initialDeadlineValue(deadlineDateJst, deadlineTimeJst, todo),
  );

  const mergedErrors = (field: keyof TodoFormInput) =>
    clientErrors[field]?.length
      ? clientErrors[field]
      : (serverState.errors?.[field] as string[] | undefined);

  const deadlineDateFormValue = useMemo(
    () => format(deadlineValue, "yyyy/MM/dd"),
    [deadlineValue],
  );
  const deadlineTimeFormValue = useMemo(
    () => format(deadlineValue, "HH:mm"),
    [deadlineValue],
  );

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
            rows={9}
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
            <input
              type="hidden"
              name="deadlineDate"
              value={deadlineDateFormValue}
            />
            <input
              type="hidden"
              name="deadlineTime"
              value={deadlineTimeFormValue}
            />
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ja}
            >
              <div>
                <DatePicker
                  label="*期限日"
                  sx={{ width: "100%" }}
                  value={deadlineValue}
                  onChange={(v) =>
                    v &&
                    setDeadlineValue(
                      (prev) =>
                        new Date(
                          v.getFullYear(),
                          v.getMonth(),
                          v.getDate(),
                          prev.getHours(),
                          prev.getMinutes(),
                          prev.getSeconds(),
                          prev.getMilliseconds(),
                        ),
                    )
                  }
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
                  label="時刻"
                  value={deadlineValue}
                  onChange={(v) =>
                    v &&
                    setDeadlineValue(
                      (prev) =>
                        new Date(
                          prev.getFullYear(),
                          prev.getMonth(),
                          prev.getDate(),
                          v.getHours(),
                          v.getMinutes(),
                          v.getSeconds(),
                          v.getMilliseconds(),
                        ),
                    )
                  }
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
          <Button component={Link} href="/todos" variant="outlined">
            キャンセル
          </Button>

          <Button type="submit" color="primary" variant="contained">
            編集
          </Button>
        </CardActions>
      </form>
    </Card>
  );
}
