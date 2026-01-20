"use client";

import { useMemo, useState } from "react";
import {
  PRIORITY,
  Priority,
  STATUS,
  Status,
  TODOS,
} from "../lib/placeholder-data";
import Link from "next/link";
import SubHeader from "../components/todos/subHeader";

export default function Todos() {
  const DISPLAYSTATUS = {
    UNTOUCHED: 0,
    DONE: 1,
    ALL: 2,
  };
  const [allTodos, setAllTodos] = useState(TODOS);
  const [displayStatus, setDisplayStatus] = useState(DISPLAYSTATUS.ALL);

  const visibleTodos = useMemo(() => {
    switch (displayStatus) {
      case DISPLAYSTATUS.UNTOUCHED:
        return allTodos.filter((t) => t.status === STATUS.UNTOUCHED);
      case DISPLAYSTATUS.DONE:
        return allTodos.filter((t) => t.status === STATUS.DONE);
      default:
        return allTodos;
    }
  }, [allTodos, displayStatus]);

  const doneCount = useMemo(() => {
    return visibleTodos.filter((todo) => todo.status === STATUS.DONE).length;
  }, [visibleTodos]);

  function handleDisplayStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedStatus = parseInt(e.target.value);
    setDisplayStatus(selectedStatus);
  }

  function toggleTodoDone(todoId: string | number, checked: boolean) {
    setAllTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? { ...t, status: checked ? STATUS.DONE : STATUS.UNTOUCHED }
          : t,
      ),
    );
  }

  function toggleAllTodoDone() {
    setAllTodos((prev) =>
      prev.map((todo) => ({ ...todo, status: STATUS.DONE })),
    );
  }

  return (
    <>
      {/* <!-- Header --> */}
      <SubHeader title={"TODO一覧"}></SubHeader>
      {/* <!-- Filters / Search (optional UI for portfolio look) --> */}
      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="sr-only">ステータス</span>
          <select
            onChange={handleDisplayStatusChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
          >
            <option value={DISPLAYSTATUS.ALL}>すべて</option>
            <option value={DISPLAYSTATUS.UNTOUCHED}>未着手</option>
            <option value={DISPLAYSTATUS.DONE}>完了</option>
          </select>
        </label>

        <Link
          href="/todos/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          ＋ TODOを追加
        </Link>
      </section>

      {/* <!-- List --> */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">今日の一覧</p>
          </div>
        </div>

        <ul className="divide-y divide-slate-200">
          {visibleTodos.map((todo) => (
            <li key={todo.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                {/* <!-- complete toggle --> */}
                <input
                  type="checkbox"
                  aria-label="完了切り替え"
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                  checked={todo.status === STATUS.DONE}
                  onChange={(e) => toggleTodoDone(todo.id, e.target.checked)}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {todo.title}
                    </p>

                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {todo.priority === PRIORITY.LOW && "優先度: 低"}
                      {todo.priority === PRIORITY.MEDIUM && "優先度: 中"}
                      {todo.priority === PRIORITY.HIGH && "優先度: 高"}
                    </span>

                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                      期限: 10:30
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {todo.content}
                  </p>
                </div>

                {/* <!-- actions --> */}
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/todos/${todo.id}`}
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  >
                    編集
                  </Link>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"
                  >
                    削除
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* <!-- footer summary --> */}
        <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            進捗:
            <span className="font-medium text-slate-900">
              完了 {doneCount}
            </span>{" "}
            /
            <span className="font-medium text-slate-900">
              全 {visibleTodos.length}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleAllTodoDone();
              }}
              type="button"
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              すべて完了
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
