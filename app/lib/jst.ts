/**
 * 日本標準時 (JST, UTC+9) で期限を扱うためのユーティリティ
 * 本システムでは deadline の入力・表示・DB 格納値の解釈をすべて JST で統一する。
 * DB には UTC の Date を格納し、入出力時に JST と相互変換する。
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const TIMEZONE_JST = "Asia/Tokyo";

/**
 * JST の年月日時分から UTC の Date を生成する（DB 保存用）
 */
export function jstToUtc(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0,
): Date {
  // UTC で同じカレンダー値の瞬間を作り、9時間前 = JST のその時刻の UTC
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, second, 0);
  return new Date(utcMs - JST_OFFSET_MS);
}

/**
 * UTC の Date を JST としてフォーマットする
 */
export function formatInJst(
  date: Date,
  options: Intl.DateTimeFormatOptions & { dateStyle?: "short" | "medium"; timeStyle?: "short" } = {},
): string {
  const resolved = {
    timeZone: TIMEZONE_JST,
    ...options,
  };
  return new Date(date).toLocaleString("ja-JP", resolved);
}

/**
 * JST で「HH:mm」形式の文字列を返す
 */
export function formatTimeJst(date: Date): string {
  return new Date(date).toLocaleString("ja-JP", {
    timeZone: TIMEZONE_JST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * JST で「yyyy/MM/dd」形式の文字列を返す（DatePicker の value 用）
 */
export function formatDateJst(date: Date): string {
  const d = new Date(date);
  const y = d.toLocaleString("ja-JP", { timeZone: TIMEZONE_JST, year: "numeric" });
  const m = d.toLocaleString("ja-JP", { timeZone: TIMEZONE_JST, month: "2-digit" });
  const day = d.toLocaleString("ja-JP", { timeZone: TIMEZONE_JST, day: "2-digit" });
  return `${y}/${m}/${day}`;
}

/**
 * UTC の Date を、編集フォーム用の JST 日付・時刻文字列に変換する。
 * Intl に依存せず UTC+9 で算出するため、どの環境でも同じ形式（yyyy/MM/dd, HH:mm）になる。
 */
export function utcToJstDateForPicker(utcDate: Date): {
  dateString: string;
  timeString: string;
} {
  const jstMs = new Date(utcDate).getTime() + JST_OFFSET_MS;
  const jst = new Date(jstMs);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  const hh = String(jst.getUTCHours()).padStart(2, "0");
  const mm = String(jst.getUTCMinutes()).padStart(2, "0");
  return {
    dateString: `${y}/${m}/${d}`,
    timeString: `${hh}:${mm}`,
  };
}

/**
 * 現在の JST の日付（年・月・日）を返す。一覧の「今日」フィルタ用。
 * Intl に依存せず UTC+9 で算出するため、どの環境でも同じ結果になる。
 */
export function getTodayJst(): { year: number; month: number; day: number } {
  const jstNowMs = Date.now() + JST_OFFSET_MS;
  const jstNow = new Date(jstNowMs);
  return {
    year: jstNow.getUTCFullYear(),
    month: jstNow.getUTCMonth() + 1,
    day: jstNow.getUTCDate(),
  };
}

/**
 * JST の「yyyy/MM/dd」と「HH:mm」から、その時刻を JST として表す UTC の Date を返す。
 * フォームの deadlineDate / deadlineTime は JST として扱う前提。
 */
export function parseJstStringsToUtc(dateStr: string, timeStr: string | undefined): Date {
  const [y, m, d] = dateStr.split("/").map(Number);
  if (!timeStr || timeStr === "") {
    return jstToUtc(y, m, d, 23, 59, 59);
  }
  const [hh, mm] = timeStr.split(":").map(Number);
  return jstToUtc(y, m, d, hh, mm, 0);
}
