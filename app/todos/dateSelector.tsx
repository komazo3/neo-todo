"use client";

import { Button } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { formatDate } from "@/app/lib/util";

type DateSelectorProps = {
  currentDate?: Date;
};

export default function DateSelector({ currentDate }: DateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayDate = useMemo(
    () => currentDate ?? new Date(),
    [currentDate],
  );

  const getDateQueryString = useCallback(
    (date: Date): string => {
      const params = new URLSearchParams(searchParams);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      params.set("date", `${year}-${month}-${day}`);
      return `?${params.toString()}`;
    },
    [searchParams],
  );

  const handlePrevDay = useCallback(() => {
    const prevDate = new Date(displayDate);
    prevDate.setDate(prevDate.getDate() - 1);
    router.push(`/todos${getDateQueryString(prevDate)}`);
  }, [displayDate, router, getDateQueryString]);

  const handleNextDay = useCallback(() => {
    const nextDate = new Date(displayDate);
    nextDate.setDate(nextDate.getDate() + 1);
    router.push(`/todos${getDateQueryString(nextDate)}`);
  }, [displayDate, router, getDateQueryString]);

  const handleToday = useCallback(() => {
    router.push(`/todos${getDateQueryString(new Date())}`);
  }, [router, getDateQueryString]);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
      <Button onClick={handlePrevDay} size="small" variant="outlined">
        ← 前日
      </Button>

      <div className="min-w-35 text-center">
        <p className="text-base font-semibold text-slate-900 sm:text-lg">
          {formatDate(displayDate)}
        </p>
      </div>

      <Button onClick={handleNextDay} size="small" variant="outlined">
        翌日 →
      </Button>

      <Button onClick={handleToday} size="small" variant="outlined">
        本日
      </Button>
    </div>
  );
}
