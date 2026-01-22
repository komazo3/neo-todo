"use client";

import { FormState, updateTodoAction } from "@/app/lib/actions";
import { PRIORITY } from "@/app/lib/placeholder-data";
import { TodoDTO } from "@/app/lib/types";
import { MenuItem, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { useActionState } from "react";
const priorities = [
  { label: "低", value: PRIORITY.LOW },
  { label: "中", value: PRIORITY.MEDIUM },
  { label: "高", value: PRIORITY.HIGH },
];
export default function Form({ todo }: { todo: TodoDTO }) {
  const initialState: FormState = { message: "", errors: {} };
  const [state, formAction] = useActionState(
    updateTodoAction.bind(null, todo.id),
    initialState,
  );
  return (
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
            defaultValue={todo.title}
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
            defaultValue={todo.content}
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
              defaultValue={todo.priority}
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
                defaultValue={todo.deadline}
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
            編集
          </button>
        </div>
      </form>
    </section>
  );
}
