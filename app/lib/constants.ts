import { Priority } from "@/generated/prisma/enums";

export const WEEKDAY_ITEMS = [
  { label: "日", value: 0 },
  { label: "月", value: 1 },
  { label: "火", value: 2 },
  { label: "水", value: 3 },
  { label: "木", value: 4 },
  { label: "金", value: 5 },
  { label: "土", value: 6 },
];

export const PRIORITY_DDL_ITEMS = [
  { label: "低", value: Priority.LOW },
  { label: "中", value: Priority.MEDIUM },
  { label: "高", value: Priority.HIGH },
];

export const DISPLAYSTATUS = {
  UNTOUCHED: "UNTOUCHED",
  DONE: "DONE",
  ALL: "ALL",
} as const;

export const SORTITEMS = {
  PRIORITY_ASC: "PRIORITY_ASC",
  PRIORITY_DESC: "PRIORITY_DESC",
  DEADLINE_ASC: "DEADLINE_ASC",
  DEADLINE_DESC: "DEADLINE_DESC",
} as const;
