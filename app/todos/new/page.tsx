"use client";

import SubHeader from "@/app/components/todos/subHeader";
import { createTodo, FormState } from "@/app/lib/actions";
import { PRIORITY } from "@/app/lib/placeholder-data";
import { useActionState } from "react";

export default function New() {
  const initialState: FormState = { message: "", errors: {} };
  const [state, formAction] = useActionState(createTodo, initialState);
  return (
    <>
      <SubHeader title={"TODOを新規登録"}></SubHeader>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form className="p-5 sm:p-6" action={formAction}>
          <div>
            <label
              htmlFor="title"
              className="flex items-center justify-between text-sm font-medium"
            >
              <span>
                タイトル
                <span className="ml-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                  必須
                </span>
              </span>
              <span className="text-xs text-slate-500">最大50文字</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="例）Next.js TODO一覧のUIを整える"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="content"
              className="flex items-center justify-between text-sm font-medium"
            >
              <span>
                内容
                <span className="ml-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                  必須
                </span>
              </span>
              <span className="text-xs text-slate-500">最大500文字</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={6}
              placeholder="やること・完了条件・メモなどを記載"
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
            ></textarea>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="priority" className="text-sm font-medium">
                優先度
                <span className="ml-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                  必須
                </span>
              </label>
              <select
                id="priority"
                name="priority"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                defaultValue={""}
              >
                <option value="" disabled>
                  選択してください
                </option>
                <option value={PRIORITY.LOW}>低</option>
                <option value={PRIORITY.MEDIUM}>中</option>
                <option value={PRIORITY.HIGH}>高</option>
              </select>
            </div>

            <div>
              <label htmlFor="deadline" className="text-sm font-medium">
                期限
                <span className="ml-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                  必須
                </span>
              </label>
              <input
                id="deadline"
                name="deadline"
                type="datetime-local"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                例）2026/01/20 18:00
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <a
              href="/todos"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              キャンセル
            </a>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              登録
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
