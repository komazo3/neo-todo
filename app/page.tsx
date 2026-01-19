export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* <!-- Header --> */}
      <header className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">今日のTODO</h1>
            <p className="mt-1 text-sm text-slate-600">
              ステータスを確認し、完了切り替え・編集・削除ができます。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              今日: 2026-01-19
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              合計: 6件
            </span>
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

            {/* <!-- Status legend --> */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>{" "}
                未着手
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>{" "}
                進行中
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>{" "}
                完了
              </span>
            </div>
          </div>
        </div>

        <ul className="divide-y divide-slate-200">
          {/* <!-- item: 未着手 --> */}
          <li className="px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              {/* <!-- complete toggle --> */}
              <input
                type="checkbox"
                aria-label="完了切り替え"
                className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    朝会の議事録をまとめてSlackに投稿する
                  </p>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    未着手
                  </span>

                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    優先度: 高
                  </span>

                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                    期限: 10:30
                  </span>
                </div>

                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  要点（決定事項・ToDo・懸念点）を3点に圧縮して投稿。リンクも添付。
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    #仕事
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    #コミュニケーション
                  </span>
                </div>
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

          {/* <!-- item: 進行中 --> */}
          <li className="px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                aria-label="完了切り替え"
                className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    Next.js TODOアプリ：一覧画面のUIを調整（Tailwind）
                  </p>

                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    進行中
                  </span>

                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                    期限: 15:00
                  </span>
                </div>

                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  ステータス表示・操作ボタンの配置・レスポンシブ対応を整える。アクセシビリティも軽く見る。
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    #個人開発
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    #Next.js
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    #UI
                  </span>
                </div>
              </div>

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

          {/* <!-- item: 完了 --> */}
          <li className="px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked
                aria-label="完了切り替え"
                className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-500 line-through">
                    PostgreSQLのローカル起動（Docker）を確認する
                  </p>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    完了
                  </span>

                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                    完了: 09:10
                  </span>
                </div>

                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  composeで立ち上げ、Prismaの接続も成功。
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    #環境構築
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    #PostgreSQL
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
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

          {/* <!-- item: 未着手（短い例） --> */}
          <li className="px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                aria-label="完了切り替え"
                className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">散歩（10分）</p>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    未着手
                  </span>

                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                    期限: 18:30
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  頭をリセットする用。
                </p>
              </div>

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
        </ul>

        {/* <!-- footer summary --> */}
        <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            進捗:
            <span className="font-medium text-slate-900">完了 1</span> /
            <span className="font-medium text-slate-900">全 6</span>
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
