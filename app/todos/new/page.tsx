"use client";

import SubHeader from "@/app/components/todos/subHeader";
import { createTodoAction, FormState } from "@/app/lib/actions";
import { Priority } from "@/generated/prisma/enums";
import { MenuItem, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { useActionState } from "react";

const priorities = [
  { label: "低", value: Priority.LOW },
  { label: "中", value: Priority.MEDIUM },
  { label: "高", value: Priority.HIGH },
];

export default function New() {
  const initialState: FormState = { message: "", errors: {} };
  const [state, formAction] = useActionState(createTodoAction, initialState);

  return (
    <>
      <SubHeader title={"TODOを追加"}></SubHeader>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form className="p-5 sm:p-6" action={formAction}>
          <div>
            <TextField
              id="title"
              name="title"
              margin="normal"
              label="タイトル"
              variant="outlined"
              required
              fullWidth
              slotProps={{ htmlInput: { maxLength: 50 } }}
            />
          </div>
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.title &&
              state.errors.title.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
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
              required
              fullWidth
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          </div>
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.content &&
              state.errors.content.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <TextField
                id="outlined-select-currency"
                name="priority"
                select
                label="優先度"
                required
                fullWidth
                defaultValue={""}
              >
                {priorities.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ja}
              >
                <DateTimePicker
                  name="deadline"
                  label="期限"
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link
              href="/todos"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              キャンセル
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              追加
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
