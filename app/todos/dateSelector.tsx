"use client";

import { Button } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { formatDate } from "../lib/util";

type Props = {
  currentDate?: Date;
};

export default function DateSelector({ currentDate }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const displayDate = currentDate || new Date();

  const getDateQueryString = (date: Date): string => {
    const params = new URLSearchParams(searchParams);
    params.set("date", date.toISOString().split("T")[0]);
    return `?${params.toString()}`;
  };

  const handlePrevDay = useCallback(() => {
    const prevDate = new Date(displayDate);
    prevDate.setDate(prevDate.getDate() - 1);
    router.push(`/todos${getDateQueryString(prevDate)}`);
  }, [displayDate, router, searchParams]);

  const handleNextDay = useCallback(() => {
    const nextDate = new Date(displayDate);
    nextDate.setDate(nextDate.getDate() + 1);
    router.push(`/todos${getDateQueryString(nextDate)}`);
  }, [displayDate, router, searchParams]);

  const handleToday = useCallback(() => {
    router.push(`/todos${getDateQueryString(new Date())}`);
  }, [router, searchParams]);

  return (
    <div className="mb-6 flex items-center justify-center gap-4">
      <Button onClick={handlePrevDay}>← 前日</Button>

      <div className="min-w-35 text-center">
        <p className="text-lg font-semibold text-slate-900">
          {formatDate(displayDate)}
        </p>
      </div>

      <Button onClick={handleNextDay}>翌日 →</Button>

      <Button onClick={handleToday}>本日</Button>
    </div>
  );
}
