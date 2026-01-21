"use client";

export default function Button() {
  function toggleAllTodoDone() {
    // setAllTodos((prev) =>
    //   prev.map((todo) => ({ ...todo, status: STATUS.DONE })),
    // );
  }
  return (
    <button
      onClick={() => {
        toggleAllTodoDone();
      }}
      type="button"
      className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
    >
      すべて完了
    </button>
  );
}
