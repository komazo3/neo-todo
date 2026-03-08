"use client";

import { useToast } from "@/app/components/toastProvider";
import {
  createRecurringTodoAction,
  createTodoAction,
} from "@/app/lib/actions";
import { PRIORITY_DDL_ITEMS, WEEKDAY_ITEMS } from "@/app/lib/constants";
import {
  recurringFormSchema,
  todoFormSchema,
  type TodoFormErrors,
  type TodoFormInput,
} from "@/app/lib/schemas";
import { CreateFormState } from "@/app/lib/types";
import {
  Button,
  Card,
  CardActions,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

export default function NewTodoForm() {
  const toast = useToast();
  const initialState: CreateFormState = { message: "", errors: {} };

  const [singleState, singleAction, isSinglePending] = useActionState(
    createTodoAction,
    initialState,
  );
  const [recurringState, recurringAction, isRecurringPending] = useActionState(
    createRecurringTodoAction,
    initialState,
  );

  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [clientErrors, setClientErrors] = useState<TodoFormErrors>({});
  const [recurringDaysError, setRecurringDaysError] = useState<string>("");

  const serverState = isRecurring ? recurringState : singleState;
  const isPending = isRecurring ? isRecurringPending : isSinglePending;

  const mergedErrors = (field: keyof TodoFormInput) =>
    clientErrors[field]?.length
      ? clientErrors[field]
      : (serverState.errors?.[field] as string[] | undefined);

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
    setRecurringDaysError("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientErrors({});
    setRecurringDaysError("");

    const formData = new FormData(e.currentTarget);

    if (isRecurring) {
      const parsed = recurringFormSchema.safeParse({
        title: formData.get("title"),
        content: formData.get("content"),
        priority: formData.get("priority"),
        recurringDays: selectedDays.length > 0 ? selectedDays.join(",") : "",
        recurringEndDate: formData.get("recurringEndDate"),
        deadlineTime: formData.get("deadlineTime"),
      });

      if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        setClientErrors({
          title: errors.title,
          content: errors.content,
          priority: errors.priority,
          deadlineTime: errors.deadlineTime,
        } as TodoFormErrors);
        setRecurringDaysError(errors.recurringDays?.[0] ?? "");
        return;
      }
      formData.set("recurringDays", selectedDays.join(","));
      startTransition(() => {
        recurringAction(formData);
        toast.success("繰り返しTODOを追加しました。");
      });
    } else {
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
        toast.success("追加しました。");
      });
    }
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
              id="outlined-select-priority"
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

          {/* 繰り返しトグル */}
          <div className="col-span-full">
            <FormControlLabel
              control={
                <Switch
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
              }
              label="繰り返し"
            />
          </div>

          {isRecurring ? (
            <>
              <div className="col-span-full">
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  *繰り返す曜日
                </Typography>
                <FormGroup row>
                  {WEEKDAY_ITEMS.map((item) => (
                    <FormControlLabel
                      key={item.value}
                      control={
                        <Checkbox
                          checked={selectedDays.includes(item.value)}
                          onChange={() => toggleDay(item.value)}
                        />
                      }
                      label={item.label}
                    />
                  ))}
                </FormGroup>
                {recurringDaysError && (
                  <FormHelperText error>{recurringDaysError}</FormHelperText>
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
            </>
          ) : (
            <>
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
            </>
          )}
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
