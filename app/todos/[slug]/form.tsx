"use client";

import { useToast } from "@/app/components/toastProvider";
import {
  updateRecurringTodoAction,
  updateTodoAction,
} from "@/app/lib/actions";
import { PRIORITY_DDL_ITEMS, WEEKDAY_ITEMS } from "@/app/lib/constants";
import {
  recurringUpdateFormSchema,
  todoFormSchema,
  type TodoFormErrors,
  type TodoFormInput,
} from "@/app/lib/schemas";
import type { RecurringEditScope, TodoDTO, UpdateFormState } from "@/app/lib/types";
import {
  Button,
  Card,
  CardActions,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { formatDateJst } from "@/app/lib/jst";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

/** JST の日付文字列 "YYYY/MM/DD" から曜日ラベルを返す */
function weekdayLabelFromJstDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split("/").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return (WEEKDAY_ITEMS.find((w) => w.value === dow)?.label ?? "") + "曜日";
}

/** "1,3,5" 形式の曜日文字列を "月曜日・水曜日・金曜日" に変換 */
function recurringDaysLabel(daysStr: string): string {
  return daysStr
    .split(",")
    .map(Number)
    .sort((a, b) => a - b)
    .map((d) => (WEEKDAY_ITEMS.find((w) => w.value === d)?.label ?? "") + "曜日")
    .join("・");
}

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
  const isRecurring = !!todo.recurringGroupId;

  const initialState: UpdateFormState = {
    message: "",
    errors: {},
    success: false,
  };

  const [singleState, singleAction, isSinglePending] = useActionState(
    updateTodoAction,
    initialState,
  );
  const [recurringState, recurringAction, isRecurringPending] = useActionState(
    updateRecurringTodoAction,
    initialState,
  );

  const serverState = isRecurring ? recurringState : singleState;
  const isPending = isRecurring ? isRecurringPending : isSinglePending;

  const [clientErrors, setClientErrors] = useState<TodoFormErrors>({});
  const [recurringScope, setRecurringScope] = useState<RecurringEditScope | null>(null);
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const mergedErrors = (field: keyof TodoFormInput) =>
    clientErrors[field]?.length
      ? clientErrors[field]
      : (serverState.errors?.[field] as string[] | undefined);

  function handleScopeSelect(scope: RecurringEditScope) {
    setRecurringScope(scope);
    setScopeDialogOpen(false);
    if (pendingFormData) {
      const fd = pendingFormData;
      fd.set("recurringScope", scope);
      startTransition(() => {
        recurringAction(fd);
        toast.success("編集しました。");
      });
      setPendingFormData(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientErrors({});

    const formData = new FormData(e.currentTarget);

    if (isRecurring) {
      const parsed = recurringUpdateFormSchema.safeParse({
        title: formData.get("title"),
        content: formData.get("content"),
        priority: formData.get("priority"),
        deadlineTime: formData.get("deadlineTime"),
      });

      if (!parsed.success) {
        setClientErrors(parsed.error.flatten().fieldErrors as TodoFormErrors);
        return;
      }

      setPendingFormData(formData);
      setScopeDialogOpen(true);
      return;
    }

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

    startTransition(() => {
      singleAction(formData);
      toast.success("編集しました。");
    });
  }

  const titleErrors = mergedErrors("title");
  const contentErrors = mergedErrors("content");
  const priorityErrors = mergedErrors("priority");
  const deadlineDateErrors = mergedErrors("deadlineDate");
  const deadlineTimeErrors = mergedErrors("deadlineTime");

  return (
    <>
      {/* 繰り返しTODO: 編集スコープ選択ダイアログ */}
      {isRecurring && (
        <Dialog open={scopeDialogOpen} disableEscapeKeyDown>
          <DialogTitle>どのTODOを編集しますか？</DialogTitle>
          <DialogContent>
            <DialogContentText>編集する範囲を選択してください。</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleScopeSelect("ONLY_THIS")}
            >
              該当のTODOのみ編集
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleScopeSelect("THIS_AND_FUTURE")}
            >
              そのTODO以降のTODOを編集
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleScopeSelect("ALL")}
            >
              すべての繰り返しTODOを編集
            </Button>
            <Button fullWidth variant="text" onClick={() => setScopeDialogOpen(false)}>
              キャンセル
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Card className="px-5 py-2">
        <form onSubmit={onSubmit}>
          <input type="hidden" name="id" value={todo.id} />
          {isRecurring && todo.recurringGroupId && (
            <>
              <input
                type="hidden"
                name="recurringGroupId"
                value={todo.recurringGroupId}
              />
              <input
                type="hidden"
                name="recurringScope"
                value={recurringScope ?? ""}
              />
            </>
          )}

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
                defaultValue={todo.title}
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
                defaultValue={todo.content}
                error={!!contentErrors?.length}
              />
              <FormHelperText>最大500文字</FormHelperText>
              {contentErrors?.length && (
                <FormHelperText error>{contentErrors[0]}</FormHelperText>
              )}
            </div>

            <div className="col-span-full sm:col-span-1">
              <TextField
                id="outlined-select-priority"
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

            {/* 曜日・終了日の表示（繰り返しTODOのみ） */}
            {isRecurring && todo.recurringGroupDays && (
              <div className="col-span-full">
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    繰り返し曜日:
                  </Typography>
                  {todo.recurringGroupDays
                    .split(",")
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map((d) => (
                      <Chip
                        key={d}
                        label={(WEEKDAY_ITEMS.find((w) => w.value === d)?.label ?? "") + "曜日"}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  {todo.recurringGroupEndDate && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        終了日:
                      </Typography>
                      <Chip
                        label={formatDateJst(todo.recurringGroupEndDate)}
                        size="small"
                        variant="outlined"
                      />
                    </>
                  )}
                </Stack>
              </div>
            )}

            {/* 繰り返しTODOの場合は期限日を編集不可（各インスタンスの日付は変えない） */}
            {!isRecurring && (
              <div className="col-span-full sm:col-span-1">
                <DatePicker
                  name="deadlineDate"
                  label="*期限日"
                  sx={{ width: "100%" }}
                  defaultValue={new Date(todo.deadline)}
                  slotProps={{
                    textField: { error: !!deadlineDateErrors?.length },
                  }}
                  disablePast
                />
                {deadlineDateErrors?.length && (
                  <FormHelperText error>{deadlineDateErrors[0]}</FormHelperText>
                )}
              </div>
            )}

            <div className="col-span-full sm:col-span-1">
              <TimePicker
                name="deadlineTime"
                label="時刻"
                sx={{ width: "100%" }}
                defaultValue={todo.isAllDay ? null : new Date(todo.deadline)}
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
              編集
            </Button>
          </CardActions>
        </form>
      </Card>
    </>
  );
}
