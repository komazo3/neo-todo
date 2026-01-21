"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
const DISPLAYSTATUS = {
  UNTOUCHED: "UNTOUCHED",
  DONE: "DONE",
  ALL: "ALL",
};
export default function StatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="block">
      <span className="sr-only">ステータス</span>
      <select
        value={current}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
      >
        <option value={DISPLAYSTATUS.ALL}>すべて</option>
        <option value={DISPLAYSTATUS.UNTOUCHED}>未着手</option>
        <option value={DISPLAYSTATUS.DONE}>完了</option>
      </select>
    </label>
  );
}
