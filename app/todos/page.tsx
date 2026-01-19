import { ST } from "next/dist/shared/lib/utils";
import { Priority, Status, Todo, TODOS } from "../lib/placeholder-data";

export default function Todos() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* <!-- Header --> */}
      <header className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">今日のTODO</h1>
          </div>
        </div>
      </header>

      {/* <!-- Filters / Search (optional UI for portfolio look) --> */}
      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="sr-only">検索</span>
          <input
            type="text"
            placeholder="TODOを検索（サンプル）"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
          />
        </label>

        <label className="block">
          <span className="sr-only">ステータス</span>
          <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200">
            <option>すべて</option>
            <option>未着手</option>
            <option>進行中</option>
            <option>完了</option>
          </select>
        </label>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          ＋ TODOを追加（サンプル）
        </button>
      </section>

      {/* <!-- List --> */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">今日の一覧</p>
          </div>
        </div>

        <ul className="divide-y divide-slate-200">
          {TODOS.map((todo) => (
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                {/* <!-- complete toggle --> */}
                <input
                  type="checkbox"
                  aria-label="完了切り替え"
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                  checked={todo.status === Status.Done}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {todo.title}
                    </p>

                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {todo.priority === Priority.low && "優先度: 低"}
                      {todo.priority === Priority.medium && "優先度: 中"}
                      {todo.priority === Priority.high && "優先度: 高"}
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
                  <button
                    type="button"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  >
                    編集
                  </button>
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
              完了 {TODOS.filter((todo) => todo.status === Status.Done).length}
            </span>{" "}
            /
            <span className="font-medium text-slate-900">
              全 {TODOS.length}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              完了を非表示（サンプル）
            </button>
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              すべて完了（サンプル）
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
